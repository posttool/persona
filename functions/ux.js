const { callLLM, processTemplate, sha256, getUrlBytes, getFileBytes } = require("./utils.js");
const {
    S42_ORGANIZE_AND_TRACK_MIRA,
    S42_ORGANIZE_AND_TRACK_PDS
} = require("./prompts/organize.js")
const { BANAUX_P1, BANAUX_P2 } = require("./prompts/genux-banaux.js");

// create an image for an "app"
function getAppFilePath(app) {
    return "/apps/" + app + ".png";
}

exports.createAppImg = functions.https.onCall({  },
    async (request, res) => {
        let filepath = getAppFilePath(request.data.app);
        const file = bucket.file(filepath);
        const exists = await file.exists();
        if (!exists[0]) {
            let type = "rounded glyph"; // neumorphic glassomorphic rounded glyph 3d cartoon frosted glass etc
            let content = "Make a " + type + " app icon for: " + request.data.app + ". It should look exactly like the current app icon for this app or like a familiar icon for this category of app. It should be contained in a circle that extends to each edge of the image. The icon should have contrast and be legible even at small sizes (use positive/negative space instead of keylines).";
            console.log(content)
            const buffer = await _generateImage(content);
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


exports.createEditorialImg = functions.https.onCall({  },
    async (request, res) => {
        let prompt = String(request.data.prompt);
        let filepath = "/editorial-2/" + sha256(prompt) + ".jpg";
        console.log(filepath);
        const file = bucket.file(filepath);
        const exists = await file.exists();
        if (!exists[0]) {
            let content = "Make a very simple graphic illustration in the style of Sebastian Curi for: " + prompt + ". ";
            console.log(content)
            const buffer = await _generateImage(content);
            await file.save(buffer);
        }
        const downloadURL = await getDownloadURL(file);
        return { url: downloadURL };
    }
);

exports.createBGForPersona = functions.https.onCall({ cors: true,  },
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

        const buffer = await _generateImage(content);
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
exports.createImg1 = functions.https.onRequest({  },
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
        const buffer = await _generateImage(content);
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



/// space services ... 


exports.makeSpaceMira = functions.https.onCall({  },
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

exports.makeSpacePds = functions.https.onCall({  },
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

exports.makeSpaceBanaux = functions.https.onCall({ timeoutSeconds: 300,  },
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
    const buffer = await _generateImage(content);
    const filepath = getImagePath("banaux-seed-1");
    const file = bucket.file(filepath);
    await file.save(buffer);
    const downloadURL = await getDownloadURL(file);
    return downloadURL;
}