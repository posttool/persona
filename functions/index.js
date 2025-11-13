if (process.env.FUNCTIONS_EMULATOR === 'true') {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}

const functions = require("firebase-functions");
const { defineSecret } = require('firebase-functions/params');

// const { google } = require('googleapis');
// const customsearch = google.customsearch('v1');
const { GoogleGenAI, Modality } = require('@google/genai');
// const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
// const googleSearchKey = defineSecret('GOOGLE_SEARCH_KEY');
// const googleVertexKey = defineSecret('GOOGLE_VERTEX_AI_KEY');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
// const GOOGLE_API_KEY = defineSecret('GOOGLE_API_KEY');
// const OpenAI = require('openai');


// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const { getDownloadURL } = require('firebase-admin/storage');
admin.initializeApp();

// Only for the server timestamp. 
const { Firestore } = require('@google-cloud/firestore');

// shortcuts
const db = admin.firestore();
const bucket = admin.storage().bucket();

function parseJSON(r) {
    if (r.indexOf("```json") != -1) {
        json = JSON.parse(r.substring(r.indexOf("```json") + 7, r.length - 4));
    } else {
        json = JSON.parse(r);
    }
    return json;
}

// genai functions
async function getGemini(key, prompt) {
    const googleGenAI = new GoogleGenAI({ apiKey: key });
    const response = await googleGenAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.candidates[0].content.parts[0].text;
}

const llmOfChoice = getGemini;
async function callLLM(key, prompt, c = 0) {
    if (c < 4) {
        if (c > 1) {
            console.log("RETRY " + c);
        }
        try {
            let r = await llmOfChoice(key, prompt);
            let json = parseJSON(r);
            return json;
        } catch (e) {
            console.log(e);
            return callLLM(key, prompt, c + 1);
        }
    } else {
        throw new Error("too many retries");
    }
}

async function runStreaming(key, prompt) {
    const ai = new GoogleGenAI({ apiKey: key });
    const model = "gemini-2.5-flash";

    console.log("Streaming response:");

    // Use generateContentStream to get an async iterable
    const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Iterate over the stream chunks
    for await (const chunk of responseStream) {
        // Print each chunk as it arrives
        process.stdout.write(chunk.text);
    }

    console.log(); // New line after the stream ends
}

async function getOpenAI(key, prompt) {
    const client = new OpenAI({ apiKey: key });

    const response = await client.responses.create({
        model: 'gpt-4o',
        input: prompt,
    });

    return response.output_text;
}

const {
    processTemplate,
    randomPersonaPrompt,
    personaImagePrompt,
    S2_DAY,
    S3_AMBIENT_OBSERVATIONS,
    S42_ORGANIZE_AND_TRACK
} = require("./prompt.js");

exports.createPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let p = randomPersonaPrompt();
        let gemResults = await getGemini(GEMINI_API_KEY.value(), p);
        let personaData = parseJSON(gemResults);
        // personaData.date = Firestore.FieldValue.serverTimestamp();
        let newPersona = await db.collection('persona').add(personaData);
        await createImageForAgent(newPersona.id);
        personaData.id = newPersona.id;
        return personaData;
    });


function personaDataResponse1(doc) {
    let data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        occupation: data.occupation,
        city: data.city,
        age: data.age,
        image: data.image,
        apps: data.apps_and_services
    };
}

exports.listPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let aa = [];
        let querySnapshot = await db.collection("persona").get();
        querySnapshot.forEach((doc) => {
            aa.push(personaDataResponse1(doc));
        });
        return aa;
    });

exports.listPersona1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let aa = [];
        let querySnapshot = await db.collection("persona").get();
        querySnapshot.forEach((doc) => {
            aa.push(personaDataResponse1(doc));
        });

        res.set('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(aa));
    });

exports.getPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        const pDoc = db.collection('persona').doc(request.data.id);
        const pSnapshot = await pDoc.get();
        const persona = pSnapshot.data();
        persona.id = pSnapshot.id;
        return persona;
    });

exports.createDayForPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        // if ! request.data.id or ! request.data.date throw error
        const pDoc = db.collection('persona').doc(request.data.id);
        const pSnapshot = await pDoc.get();
        const persona = pSnapshot.data();
        persona.id = pSnapshot.id;
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
        let writeResult = await db.collection('day').add(dayData);
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
        res.set('Content-Type', 'application/json');
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
            delete doc.personaId;
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
            delete doc.personaId;
            aa.push(d);
        });
        res.set('Content-Type', 'application/json');
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
    //{time: "06:32:13", device: 'watch', type: 'notification', senderApp: 'LocalTube', data: 'train late'},
    observations.forEach(obs => {
        obs.date = day.date;
        obs.personaId = persona.id;
        db.collection('observations').add(obs);
    });
    step += 1;
    if (step < day.events.length) {
        setTimeout(e => {
            generateEventsForDay(persona, day, step);
        }, 10000);
    }
}


exports.makeASpace1 = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let aa = "";
        let querySnapshot = await db.collection("observations")
            .where("personaId", "==", request.data.id)
            .where("date", "==", request.data.date)
            .orderBy("time")
            .get();
        let x = 0;
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            delete d.personaId;
            delete d.date;
            if (x >= request.data.startIdx && x <= request.data.endIdx)
                aa += JSON.stringify(d) + "\n";
            x++;
        });
        let prompt = processTemplate(S42_ORGANIZE_AND_TRACK, {
            // user: JSON.stringify(persona),
            observations: aa,
            date: request.data.date
        });
        console.log(prompt)
        let spaces = await callLLM(GEMINI_API_KEY.value(), prompt);
        return spaces;
    });






// util
async function ___igquery(key, prompt) {
    const AI = new GoogleGenAI({ apiKey: key });
    const response = await AI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        // Based on the part type, either show the text or save the image
        if (part.text) {
            console.log(part.text);
        } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, "base64");
            // fs.writeFileSync("gemini-native-image.png", buffer);
            // console.log("Image saved as gemini-native-image.png");
            return buffer;
        }
    }
}



// exports.testImage = functions
//     .runWith({ secrets: [GEMINI_API_KEY] })
//     .https.onCall(async (data, context) => {
//         var prompt = data.prompt + ' ' + data.xtra;
//         const e = await ___igquery(googleVertexKey.value(), prompt.trim());
//         return e;
//     });

exports.updateImage = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        return await createImageForAgent(request.data.id);
    });

async function createImageForAgent(id) {
    const agentDoc = db.collection('persona').doc(id);
    const agentSnap = await agentDoc.get();
    const agent = agentSnap.data();
    agent.id = agentSnap.id;
    const file = await createImageForBucket(GEMINI_API_KEY.value(), personaImagePrompt(agent), agent.id);
    const downloadURL = await getDownloadURL(file);
    console.log(downloadURL);
    const r = await agentDoc.update({ image: downloadURL });
    return { url: downloadURL };
}

async function createImageForBucket(key, prompt, root = "member") {
    console.log('create ' + prompt);
    var buff = await ___igquery(key, prompt.trim());
    const morepath = Math.floor(Math.random() * 10000000000);
    const filePath = `${root}/${morepath}/pic.jpg`;
    const file = bucket.file(filePath);
    await file.save(buff);
    return file;
}
