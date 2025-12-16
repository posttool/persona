if (process.env.FUNCTIONS_EMULATOR === "true") {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
}

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { defineSecret } = require("firebase-functions/params");
const { getDownloadURL } = require("firebase-admin/storage");
const { Firestore } = require("@google-cloud/firestore");
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const { GoogleGenAI, Modality, createUserContent, createPartFromUri } = require("@google/genai");
const { callLLM, getGemini, processTemplate, parseJSON } = require("./utils.js");
const { createHash } = require('node:crypto');
const path = require('path');
const { argv, cwd } = require('process');
const PDFDocument = require('pdfkit');


const {
    randomPersonaPrompt,
    personaPrompt,
    personaImagePrompt,
    S2_DAY,
    S3_AMBIENT_OBSERVATIONS
} = require("./prompts/persona.js");

const {
    S42_ORGANIZE_AND_TRACK_MIRA,
    S42_ORGANIZE_AND_TRACK_PDS
} = require("./prompts/organize.js")

const { GENUX_P2 } = require("./prompts/genux-yield.js");

const { BANAUX_P1, BANAUX_P2 } = require("./prompts/genux-banaux.js");

exports.createPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let p = randomPersonaPrompt();
        let gemResults = await getGemini(GEMINI_API_KEY.value(), p);
        let personaData = parseJSON(gemResults);
        // personaData.date = Firestore.FieldValue.serverTimestamp();
        let newPersona = await db.collection("persona").add(personaData);
        await createImageForAgent(newPersona.id);
        personaData.id = newPersona.id;
        return personaData;
    });

exports.createPersona2 = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let p = personaPrompt(request.data.location, request.data.age, request.data.gender, request.data.extra);
        let gemResults = await getGemini(GEMINI_API_KEY.value(), p);
        let personaData = parseJSON(gemResults);
        // personaData.date = Firestore.FieldValue.serverTimestamp();
        let newPersona = await db.collection("persona").add(personaData);
        await createImageForAgent(newPersona.id);
        personaData.id = newPersona.id;
        return personaData;
    });

function personaResponseData(doc) {
    let data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        occupation: data.occupation,
        city: data.city,
        age: data.age,
        image: data.image,
        imageBG: data.imageBG,
        apps: data.apps_and_services
    };
}

exports.listPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let personaResponse = [];
        let query = db.collection("persona")
            .orderBy("name")
            .startAt(request.data && request.data.startAt ? request.data.startAt : "A")
            .limit(request.data && request.data.limit ? Number(request.data.limit) : 20);
        let querySnapshot = await query.get();
        querySnapshot.forEach((doc) => {
            personaResponse.push(personaResponseData(doc));
        });
        return personaResponse;
    });

exports.listPersona1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let personaResponse = [];
        let querySnapshot = await db.collection("persona").get();
        querySnapshot.forEach((doc) => {
            personaResponse.push(personaResponseData(doc));
        });

        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(personaResponse));
    });

async function _getPersona(id) {
    const pDoc = db.collection("persona").doc(id);
    const pSnapshot = await pDoc.get();
    const persona = pSnapshot.data();
    persona.id = pSnapshot.id;
    return persona;
}
exports.getPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        return await _getPersona(request.data.id);
    });

exports.createDayForPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        // if ! request.data.id or ! request.data.date throw error
        const persona = await _getPersona(request.data.id)
        let otherDays = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", request.data.id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            otherDays.push(d);
        });
        let prompt = processTemplate(S2_DAY, {
            user: JSON.stringify(persona),
            date: request.data.date.toString(),
            otherDays: JSON.stringify(otherDays)
        });
        console.log(prompt)
        let dayData = await callLLM(GEMINI_API_KEY.value(), prompt);
        dayData.personaId = request.data.id;
        // dayData.__date = Firestore.FieldValue.serverTimestamp();
        let writeResult = await db.collection("day").add(dayData);
        dayData.id = writeResult.id;
        generateEventsForDay(persona, dayData);
        return dayData;
    });

exports.listDaysForPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let aa = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", request.data.id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            aa.push(d);
        });
        return aa;
    });

exports.listDaysForPersona1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        console.log(request)
        let aa = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", request.query.id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            aa.push({
                id: doc.id,
                date: data.date
            });
        });
        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(aa));
    });

exports.listObservations = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let aa = [];
        let querySnapshot = await db.collection("observations")
            .where("personaId", "==", request.data.id)
            .where("date", "==", request.data.date)
            .orderBy("time")
            .get();
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            delete d.personaId;
            aa.push(d);
        });
        return aa;
    });

exports.listObservations1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let aa = [];
        let querySnapshot = await db.collection("observations")
            .where("personaId", "==", request.query.id)
            .where("date", "==", request.query.date)
            .orderBy("time")
            .get();
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            delete d.personaId;
            aa.push(d);
        });
        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(aa));
    });

async function generateEventsForDay(persona, day, step = 0) {
    console.log("***********************generateEventsForDay", persona.id, step)
    let prompt = processTemplate(S3_AMBIENT_OBSERVATIONS, {
        user: JSON.stringify(persona),
        day: JSON.stringify(day),
        event: JSON.stringify(day.events[step]),
        date: day.date
    });
    let observations = await callLLM(GEMINI_API_KEY.value(), prompt);
    //{time: "06:32:13", device: "watch", type: "notification", senderApp: "LocalTube", data: "train late"},
    observations.forEach(obs => {
        obs.date = day.date;
        obs.personaId = persona.id;
        db.collection("observations").add(obs);
    });
    step += 1;
    if (step < day.events.length) {
        setTimeout(e => {
            generateEventsForDay(persona, day, step);
        }, 10000);
    }
}

// image generation ... a bit messy!

async function ___igquery(key, contents) {
    const AI = new GoogleGenAI({ apiKey: key });
    const response = await AI.models.generateContent({
        model: "gemini-3-pro-image-preview", // "gemini-2.5-flash-image"
        contents: contents,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            console.log(part.text);
        } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, "base64");
            return buffer;
        }
    }
}

exports.updateImage = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        return await createImageForAgent(request.data.id);
    });

async function createImageForAgent(id) {
    const pDoc = db.collection("persona").doc(id);
    const pSnapshot = await pDoc.get();
    const persona = pSnapshot.data();
    persona.id = pSnapshot.id;
    const buffer = await ___igquery(GEMINI_API_KEY.value(), personaImagePrompt(persona));
    const filepath = getImagePath(id);
    const file = bucket.file(filepath);
    await file.save(buffer);
    // console.log("SAVED ", file)
    const downloadURL = await getDownloadURL(file);
    console.log("createImageForAgent " + downloadURL);
    await pDoc.update({ image: downloadURL });
    return { url: downloadURL };
}

function getImagePath(bp) {
    const morepath = Math.floor(Math.random() * 10000000000);
    return `/${bp}/img_${morepath}.jpg`;
}

// create an image for an "app"
function getAppFilePath(app) {
    return "/apps/" + app + ".png";
}

exports.createAppImg = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        let filepath = getAppFilePath(request.data.app);
        const file = bucket.file(filepath);
        const exists = await file.exists();
        if (!exists[0]) {
            let type = "rounded glyph"; // neumorphic glassomorphic rounded glyph 3d cartoon frosted glass etc
            let content = "Make a " + type + " app icon for: " + request.data.app + ". It should look exactly like the current app icon for this app or like a familiar icon for this category of app. It should be contained in a circle that extends to each edge of the image. The icon should have contrast and be legible even at small sizes (use positive/negative space instead of keylines).";
            console.log(content)
            const buffer = await ___igquery(GEMINI_API_KEY.value(), content);
            await file.save(buffer);
            // const data = await sharp(buffer)
            //     .resizeTo(128, 128)
            //     .toFormat("png")
            //     .toBuffer();
        }
        const downloadURL = await getDownloadURL(file);
        return { url: downloadURL };
    }
);

function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}
exports.createEditorialImg = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        let prompt = String(request.data.prompt);
        let filepath = "/editorial-2/" + sha256(prompt) + ".jpg";
        console.log(filepath);
        const file = bucket.file(filepath);
        const exists = await file.exists();
        if (!exists[0]) {
            let content = "Make a very simple graphic illustration in the style of Sebastian Curi for: " + prompt + ". ";
            console.log(content)
            const buffer = await ___igquery(GEMINI_API_KEY.value(), content);
            await file.save(buffer);
        }
        const downloadURL = await getDownloadURL(file);
        return { url: downloadURL };
    }
);

exports.createBGForPersona = functions.https.onCall({ cors: true, secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        const pDoc = db.collection("persona").doc(request.query.id);
        const pSnapshot = await pDoc.get();
        const persona = pSnapshot.data();
        persona.id = pSnapshot.id;

        const content = "Make two amazing lock screen and background wallpaper image for this person's mobile phone. " +
            "Put one for daytime on the left and another for evening on the right. " +
            "Make sure each wallpaper fills exactly half the canvas and touches and edge or the center line. No borders or matts. Full bleed. Another program will crop the images an expects them to fill the canvas. " +
            "Dont use photography. Dont show poeple. Make the wallpaer atmospheric or patterned.  " +
            "Make the image based on the person's hobbies. Be authentic to their vibe.   " +
            "Person info: " + JSON.stringify(persona);

        const buffer = await ___igquery(GEMINI_API_KEY.value(), content);
        const filepath = getImagePath(persona.id);
        const file = bucket.file(filepath);
        file.save(buffer);
        const downloadURL = await getDownloadURL(file);
        let updateD = {};
        updateD["imageBG"] = downloadURL;
        const r = await pDoc.update(updateD);

        return { url: downloadURL };

    }
);

// experiment to create an image for persona afternoon / evening etc
exports.createImg1 = functions.https.onRequest({ secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        // get persona
        const pDoc = db.collection("persona").doc(request.query.id);
        const pSnapshot = await pDoc.get();
        const persona = pSnapshot.data();
        persona.id = pSnapshot.id;
        // get the day
        let day = null;
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", request.query.id)
            .where("date", "==", request.query.date)
            .get();
        querySnapshot.forEach((snap) => {
            day = snap.data();
            day.id = snap.id;
        });
        console.log(day);

        let personBuf = await getUrlBytes(persona.image);

        // make image of them in the current environemnt of observations
        const prompt = "Make a photo taken on a mobile phone where the person pictured (" +
            persona.name + ") is going through the " + request.query.dayPart + " of their day. Make sure the photo " +
            "is natural and candid. Don't overlay text or speech bubbles. Here is " +
            "their day: " + JSON.stringify(day);

        const content = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: personBuf.toString("base64"),
                },
            },
        ];
        const buffer = await ___igquery(GEMINI_API_KEY.value(), content);
        const filepath = getImagePath(persona.id);
        const file = bucket.file(filepath);
        file.save(buffer);
        const downloadURL = await getDownloadURL(file);
        console.log(downloadURL);
        let updateD = {};
        updateD["image" + request.query.dayPart] = downloadURL;
        const r = await pDoc.update(updateD);

        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify({ url: downloadURL }));
    });


const https = require("https");
async function getUrlBytes(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Request failed with status code ${response.statusCode}`));
                return;
            }
            const chunks = [];
            response.on("data", (chunk) => {
                chunks.push(chunk);
            });
            response.on("end", () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
            response.on("error", (err) => {
                reject(err);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

const fs = require('fs');

async function getFileBytes(filePath) {
    return new Promise((resolve, reject) => {

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                reject(err);
                return;
            }

            // 'data' is a Buffer object containing the file's bytes
            console.log('File content as Buffer:', data);
            resolve(data);
            return;

            // For example, using UTF-8 encoding:
            const fileContentString = data.toString('utf8');
            console.log('File content as string (UTF-8):', fileContentString);

            // To get the size of the file in bytes:
            const fileSizeInBytes = data.length;
            console.log('File size in bytes:', fileSizeInBytes);
        });
    });

}


/// space services ... 

async function getObservations(id, date, start, end) {
    // get persona
    const pDoc = db.collection("persona").doc(id);
    const pSnapshot = await pDoc.get();
    const persona = pSnapshot.data();
    // collect observations
    let observations = [];
    let querySnapshot = await db.collection("observations")
        .where("personaId", "==", id)
        .where("date", "==", date)
        .orderBy("time")
        .get();
    let x = 0;
    querySnapshot.forEach((doc) => {
        let d = doc.data();
        d.id = doc.id;
        delete d.personaId;
        delete d.date;
        if (x >= start && x <= end)
            observations.push(d);
        x++;
    });
    return { persona: persona, observations: observations };
}

exports.makeSpaceMira = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let sd = await getObservations(request.data.id, request.data.date, request.data.start, request.data.end)
        let prompt = processTemplate(S42_ORGANIZE_AND_TRACK_MIRA, {
            user: sd.persona.name,
            observations: JSON.stringify(sd.observations),
            date: request.data.date
        });
        let spaces = await callLLM(GEMINI_API_KEY.value(), prompt);
        return spaces;
    });

exports.makeSpacePds = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let sd = await getObservations(request.data.id, request.data.date, request.data.start, request.data.end)
        let prompt = processTemplate(S42_ORGANIZE_AND_TRACK_PDS, {
            user: sd.persona.name,
            observations: JSON.stringify(sd.observations),
            date: request.data.date
        });
        let spaces = await callLLM(GEMINI_API_KEY.value(), prompt);
        return spaces;
    });

exports.makeSpaceBanaux = functions.https.onCall({ timeoutSeconds: 300, secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let sd = await getObservations(request.data.id, request.data.date, request.data.start, request.data.end)
        let prompt = processTemplate(S42_ORGANIZE_AND_TRACK_PDS, {
            user: sd.persona.name,
            observations: JSON.stringify(sd.observations),
            date: request.data.date
        });
        let spaces = await callLLM(GEMINI_API_KEY.value(), prompt);
        console.log(spaces);

        let designGuidelinesImg = "mira-image.png";
        if (request.data.template != "") {
            designGuidelinesImg = request.data.template;
        }
        const downloadURL = await createUXForSpaces(GEMINI_API_KEY, spaces, BANAUX_P2, designGuidelinesImg);
        return { url: downloadURL };
    });

async function createUXForSpaces(GEMINI_API_KEY, spaces, uxPrompt, uxGuidelinesImg) {
    const bananaPrompt = processTemplate(uxPrompt, { userInfo: JSON.stringify(spaces) });
    const imgAbsolutePath = path.resolve(cwd(), "res/" + uxGuidelinesImg);
    let imgBytes = await getFileBytes(imgAbsolutePath);
    const content = [
        { text: bananaPrompt },
        {
            inlineData: {
                mimeType: "image/png",
                data: imgBytes.toString("base64"),
            },
        },
    ];
    const buffer = await ___igquery(GEMINI_API_KEY.value(), content);
    const filepath = getImagePath("banaux-seed-1");
    const file = bucket.file(filepath);
    await file.save(buffer);
    const downloadURL = await getDownloadURL(file);
    return downloadURL;
}

/// simulation runs

exports.runSimulation = functions.https.onCall({ timeoutSeconds: 300, secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        runSimulation("test"); //request.data.name
        return true;
    });


async function runSimulation(name) {
    let allPersona = await db.collection("persona").orderBy("name").get();
    allPersona.forEach(async (persona) => {
        let daysForPersona = await db.collection("day")
            .where("personaId", "==", persona.id)
            .orderBy("date")
            .get();
        daysForPersona.forEach(async (day) => {
            let date = day.data().date
            let col1 = db.collection("observations")
                .where("personaId", "==", persona.id)
                .where("date", "==", date);
            const snapshot = await col1.count().get();
            let c = snapshot.data().count;
            if (c > 120) {
                let testFolder = path.resolve(cwd(), "res/");
                fs.readdir(testFolder, (err, files) => { // reading the dir is a temporary step to adding the "styles" in the db
                    files.forEach((file, idx) => {

                        let p = BANAUX_P1;
                        if (idx > 3)   // would be better to associate files with prompts
                            p = BANAUX_P2;
                        let props = {
                            runName: name,
                            id: persona.id,
                            date: date,
                            prompt: p,
                            imagePrompt: file
                        };
                        _queue("generate-screen", {
                            ...props,
                            start: 0,
                            end: c / 3,
                            dayPart: "a-morning"
                        });
                        _queue("generate-screen", { ...props, start: c / 3, end: c * (2 / 3), dayPart: "b-afternoon" });
                        _queue("generate-screen", { ...props, start: c * (2 / 3), end: c, dayPart: "c-evening" });
                    });
                });
            }

        });
    });

}



exports.processQueue = functions.https.onCall({ cors: true, secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        _processQ(GEMINI_API_KEY, 8);
        return true;
    });

exports.listUx = functions.https.onCall({ cors: true, secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        console.log(request.data.runName, request.data.id);
        const uxes = await db.collection('ux')
            .where("runName", "==", request.data.runName)
            .where("personaId", "==", request.data.id)
            .orderBy("data.date")
            .get();

        let results = [];
        uxes.forEach(ux => {
            results.push(ux.data());
        });
        return results;
    });

async function _getPersonaWithUx(runName) {
    const uxes = await db.collection('ux')
        .where("runName", "==", runName)
        .get();

    let results = {};
    uxes.forEach((ux) => { // even if marked async, await does not work
        let key = ux.data().personaId;
        if (!(key in results)) {
            results[key] = true;
        }
    });
    for (const p in results) { // await works with "in"
        results[p] = await _getPersona(p);
    }
    return results;
}
exports.getPersonaWithUx = functions.https.onCall({ cors: true, secrets: [] },
    async (request, context) => {
        return await _getPersonaWithUx(request.data.runName);
    });


async function loadCustomFont(doc) {
    const fontUrl = 'https://example.com/fonts/OpenSans-Regular.ttf'; // Use the correct font format (TTF, OTF, WOFF, WOFF2)
    try {
        const response = await fetch(fontUrl);
        const fontArrayBuffer = await response.arrayBuffer();
        doc.font(fontArrayBuffer, 'OpenSans-Regular', 12);
        doc.text('Text with custom font!', 100, 100);
    } catch (error) {
        console.error('Error loading font:', error);
    }
}
exports.makePdf = functions.https.onCall({ cors: true, secrets: [] },
    async (request, context) => {
        const doc = new PDFDocument({ layout: "landscape" });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const morepath = Math.floor(Math.random() * 10000000000);
            const file = bucket.file("pdf/" + request.data.runName + "/" + morepath + ".pdf");
            console.log("saving " + file + " maybe")
            await file.save(pdfBuffer);
            const downloadURL = await getDownloadURL(file);
            console.log(downloadURL); // TODO put in db "ux-reports"
        });

        async function makeDoc() {
            doc
                .fontSize(50)
                .text("All persona batch")
                .fontSize(25)
                .text("Run name: " + request.data.runName)
                .fontSize(12)
                .text((new Date()).toString());
            // date

            let persona = await _getPersonaWithUx(request.data.runName);
            for (const personaId in persona) {
                let p = persona[personaId];
                doc
                    .addPage()
                    .fontSize(25)
                    .font('Helvetica-Bold')
                    .text(p.name)
                    .font('Helvetica');

                let personBuf = await getUrlBytes(p.image);
                doc.image(personBuf, { width: 300 });


                // gather their ux's
                const uxes = await db.collection('ux')
                    .where("runName", "==", request.data.runName)
                    .where("personaId", "==", personaId)
                    .orderBy("data.date")
                    .get();

                let uxResults = [];
                let dates = {};
                uxes.forEach(ux => {
                    ux = ux.data();
                    uxResults.push(ux);
                    dates[ux.data.date] = true;
                });

                // more info about the day(s)
                for (const date in dates) {
                    doc
                        .addPage()
                        .fontSize(25)
                        .font('Helvetica-Bold')
                        .text(date)
                        .fontSize(9)
                        .font('Helvetica');
                    let daysSnap = await db.collection("day")
                        .where("personaId", "==", personaId)
                        .where("date", "==", date)
                        .get();
                    daysSnap.forEach((day) => {
                        day.data().events.forEach(event => {
                            doc.text(event.time + " " + event.description);
                        })
                    });
                    doc.text("Detailed Observations");
                    let obsSnap = await db.collection("observations")
                        .where("personaId", "==", personaId)
                        .where("date", "==", date)
                        .orderBy("time")
                        .get();

                    let table = doc
                        .fontSize(7)
                        .table({
                            rowStyles: { border: false },
                            columnStyles: [50, 50, 50, 50, 50, "*"],
                        });
                    obsSnap.forEach((obs) => {
                        obs = obs.data();
                        table.row([obs.time, obs.device, obs.type, obs.senderApp, obs.sender, obs.data]);
                    });
                }

                uxResults.sort((a, b) => {
                    let akey = a.data.imagePrompt + "-" + a.data.date + "-" + a.data.dayPart;
                    let bkey = b.data.imagePrompt + "-" + b.data.date + "-" + b.data.dayPart;
                    if (akey < bkey) {
                        return -1;
                    }
                    if (akey > bkey) {
                        return 1;
                    }
                    return 0;
                });
                for (const i in uxResults) {
                    const ux = uxResults[i];
                    doc
                        .addPage()
                        .fontSize(25)
                        .text(ux.data.date + " " + ux.data.dayPart)
                        .fontSize(12)
                        .text(ux.data.imagePrompt);

                    let uxBuf = await getUrlBytes(ux.url);
                    doc.image(uxBuf, { width: 600 });
                }

            }
            doc.end();
        }
        makeDoc();
        return "working...";

    });
// exports.scheduledFunction = functions
//     .runWith({ secrets: [GEMINI_API_KEY] })
//     .pubsub.schedule('* * * * *').onRun((context) => {
//         functions.logger.info('On the minute * * * * * !');
//         return _processQ();
//     });

async function _queue(fname, data) {
    let doc = {
        fname: fname,
        data: data,
        state: 'init',
        created: Firestore.FieldValue.serverTimestamp()
    };
    return await db.collection('service-queue').add(doc);
}

async function _processQ(GEMINI_API_KEY, batchSize = 8) {
    const qItems = await db.collection('service-queue')
        .where('state', '==', 'init')
        .orderBy('created', 'asc')
        .limit(batchSize)
        .get();
    qItems.forEach(async qItem => { // TODO async doesnt work here :)
        try {
            qItem.ref.update({ state: 'processing' });
            await _processRequest(GEMINI_API_KEY, qItem.data());
            qItem.ref.update({ state: 'complete' });
        }
        catch (err) {
            qItem.ref.update({ state: 'error', errorMessage: err.message });
            console.error(err);
        }
    });
}

async function _processRequest(GEMINI_API_KEY, r) {
    console.log(' ** process request ' + r.fname);
    switch (r.fname) {
        case 'generate-screen':
            return await generateScreen(GEMINI_API_KEY, r.data);
        case 'generate-observations':
            return await addResponse(r.data.agent, r.data.intro);
    }
}

async function generateScreen(GEMINI_API_KEY, data) {
    let sd = await getObservations(data.id, data.date, data.start, data.end);
    // let sd = await getObservations(request.data.id, request.data.date, request.data.start, request.data.end)
    let prompt = processTemplate(S42_ORGANIZE_AND_TRACK_PDS, {
        user: sd.persona.name,
        observations: JSON.stringify(sd.observations),
        date: data.date
    });
    console.log("getting space")
    let spaces = await callLLM(GEMINI_API_KEY.value(), prompt);
    console.log("got space, getting image")
    let url = await createUXForSpaces(GEMINI_API_KEY, spaces, data.prompt, data.imagePrompt);
    console.log("got image " + url)
    await db.collection('ux').add({
        runName: data.runName,
        personaId: data.id,
        url: url,
        data: data,
    });
}


/// html gen

exports.testHTML = functions.https.onRequest({ secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        // let prompt = processTemplate(S2_DAY, {
        //     user: JSON.stringify(persona),
        //     date: request.data.date.toString(),
        //     otherDays: JSON.stringify(otherDays)
        // });
        let htmlresponse = await getGemini(GEMINI_API_KEY.value(), GENUX_P2, "gemini-2.5-pro");
        console.log(htmlresponse);
        return htmlresponse;
    });