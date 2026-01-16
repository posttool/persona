if (process.env.FUNCTIONS_EMULATOR === "true") {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
}

const functions = require("firebase-functions");
const {onSchedule} = require("firebase-functions/scheduler");
const admin = require("firebase-admin");
const { defineSecret } = require("firebase-functions/params");
const { getDownloadURL } = require("firebase-admin/storage");
const { Firestore } = require("@google-cloud/firestore");
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const { GoogleGenAI, Modality, createUserContent, createPartFromUri } = require("@google/genai");
const { callLLM, processTemplate, wait, generateImage } = require("./utils.js");

const path = require('path');
const { argv, cwd } = require('process');

const {
    randomPersonaPrompt,
    personaPrompt,
    personaImagePrompt,
    S2_DAY,
    S3_AMBIENT_OBSERVATIONS
} = require("./prompts/persona.js");

const { GENUX_P2 } = require("./prompts/genux-yield.js");

// user managerment

function getMemberDoc(id) {
    return db.collection("member").doc(id);
}

exports.getMember = functions.https.onCall({ cors: true },
    async (request, context) => {
        let member = null;
        if (request.auth && request.auth.uid) {
            let docRef = getMemberDoc(request.auth.uid);
            let doc = await docRef.get();
            if (doc.exists) {
                member = doc.data();
            } else {
                member = {
                    userObject: request.auth,
                    createdAt: Firestore.FieldValue.serverTimestamp(),
                    isAdmin: false
                };
                await docRef.set(member);
            }
            member.id = request.auth.uid;
        }
        return member;
    });

// persona management

exports.createPersona = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let personaData = await callLLM(GEMINI_API_KEY.value(), randomPersonaPrompt());
        let newPersona = await db.collection("persona").add(personaData);
        await createImageForAgent(newPersona.id);
        personaData.id = newPersona.id;
        return personaData;
    });

exports.createPersona2 = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let p = personaPrompt(request.data.location, request.data.age, request.data.gender, request.data.extra);
        let personaData = await callLLM(GEMINI_API_KEY.value(), p);
        let newPersona = await db.collection("persona").add(personaData);
        await createImageForAgent(newPersona.id);
        personaData.id = newPersona.id;
        return personaData;
    });

function _getPDoc(id) {
    return db.collection("persona").doc(id);
}

async function _getPersona(id, getDays = false) {
    const doc = _getPDoc(id);
    const snapshot = await doc.get();
    if (!snapshot.exists)
        throw new Error("No such " + id);
    const persona = snapshot.data();
    persona.id = snapshot.id;
    if (getDays) {
        persona.days = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            let d = { id: doc.id, date: doc.data().date };
            persona.days.push(d);
        });
    }
    return persona;
}

function _sanitizePersona(doc) {
    let data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        occupation: data.occupation,
        city: data.city,
        age: data.age,
        image: data.image,
        // imageBG: data.imageBG,
        // apps: data.apps_and_services
    };
}

exports.listPersona = functions.https.onCall({},
    async (request, context) => {
        let personaResponse = [];
        let query = db.collection("persona")
            .orderBy("name")
            .startAt(request.data && request.data.startAt ? request.data.startAt : "A")
            .limit(request.data && request.data.limit ? Number(request.data.limit) : 20);
        let querySnapshot = await query.get();
        querySnapshot.forEach((doc) => {
            personaResponse.push(_sanitizePersona(doc));
        });
        return personaResponse;
    });

exports.listPersona1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let personaResponse = [];
        let querySnapshot = await db.collection("persona").get();
        querySnapshot.forEach((doc) => {
            personaResponse.push(_sanitizePersona(doc));
        });
        res.set("Content-Type", "application/json");
        res.status(200).send(personaResponse);
    });

exports.getPersona = functions.https.onCall({},
    async (request, context) => {
        return await _getPersona(request.data.id);
    });

exports.getPersona1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        res.set("Content-Type", "application/json");
        res.status(200).send(await _getPersona(request.query.id, true));
    });

exports.listDaysForPersona = functions.https.onCall({},
    async (request, context) => {
        let response = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", request.data.id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            let d = { id: doc.id, ...doc.data() };
            response.push(d);
        });
        return response;
    });

exports.listDaysForPersona1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let response = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", request.query.id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            response.push({
                id: doc.id,
                date: data.date
            });
        });
        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(response));
    });

exports.listObservations = functions.https.onCall({},
    async (request, context) => {
        let response = [];
        let querySnapshot = await db.collection("observations")
            .where("personaId", "==", request.data.id)
            .where("date", "==", request.data.date)
            .orderBy("time")
            .get();
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            delete d.personaId;
            response.push(d);
        });
        return response;
    });

exports.listObservations1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let response = [];
        let querySnapshot = await db.collection("observations")
            .where("personaId", "==", request.query.id)
            .where("date", "==", request.query.date)
            .orderBy("time")
            .get();
        querySnapshot.forEach((doc) => {
            let d = doc.data();
            d.id = doc.id;
            delete d.personaId;
            response.push(d);
        });
        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(response));
    });


// image generation ... 

exports.updateImage = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        return await createImageForAgent(request.data.id);
    });

async function createImageForAgent(id) {
    const persona = await _getPersona(id);
    const buffer = await generateImage(GEMINI_API_KEY.value(), personaImagePrompt(persona));
    const filepath = getImagePath(id);
    const file = bucket.file(filepath);
    await file.save(buffer);
    const downloadURL = await getDownloadURL(file);
    console.log("createImageForAgent " + downloadURL);
    await _getPDoc(id).update({ image: downloadURL });
    return { url: downloadURL };
}

function getImagePath(bp) {
    const morepath = Math.floor(Math.random() * 10000000000);
    return `/${bp}/img_${morepath}.jpg`;
}


/// simulation runs
const GENERATE_DAY_TASK = "generate-day"; // (persona id, dayNumber, date, steering)
const GENERATE_OBSERVATION_TASK = "generate-observation"; // (id, date, index)

exports.runSimulation = functions.https.onCall({ cors: true, secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        console.log(request.data)
        let simRunId = await initSim(request.data);
        return simRunId;
    });


exports.runSimulationForAll = functions.https.onCall({ cors: true, secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let allPersona = await db.collection("persona").orderBy("name").get();
        let personaIds = [];
        allPersona.forEach(persona => personaIds.push(persona.id));
        for (let i = 0; i < personaIds.length; i++) {
            await initSim({ ...request.data, personaId: personaIds[i] });
        }
        _processQ();
        return 1;
    });

exports.scheduledFunction = onSchedule({ schedule: '* * * * *', secrets: [GEMINI_API_KEY] },  
    (event) => {
        console.log(event);
        console.log('On the minute * * * * * !');
        return _processQ();
    });

exports.processQueue = functions.https.onRequest({ cors: true, secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        _processQ();
        res.set("Content-Type", "application/json");
        res.status(200).send("OK");
    });

async function _queue(fname, data) {
    let doc = {
        fname: fname,
        data: data,
        state: 'init',
        created: Firestore.FieldValue.serverTimestamp()
    };
    return await db.collection('service-queue').add(doc);
}

let _qWorking = false;
async function _processQ(batchSize = 8) {
    if (_qWorking)
        throw new Error("Already working...")
    _qWorking = true;
    const qItems = await db.collection('service-queue')
        .where('state', '==', 'init')
        .orderBy('created', 'asc')
        .limit(batchSize)
        .get();
    let promises = []
    qItems.forEach(qItem => {
        promises.push(_processQItem(qItem.ref, qItem.data()));
    });
    console.log(promises);
    const results = await Promise.all(promises);
    _qWorking = false;
    if (!qItems.empty)
        _processQ(batchSize);
}

async function _processQItem(ref, data) {
    try {
        ref.update({ state: 'processing' });
        await _processRequest(data);
        ref.update({ state: 'complete' });
        return true;
    }
    catch (err) {
        ref.update({ state: 'error', errorMessage: err.message });
        console.error(err);
        return false;
    }
}

async function _processRequest(r) {
    console.log(' ** process request ' + r.fname);
    switch (r.fname) {
        // case 'generate-screen':
        //     return await generateScreen(r.data);
        // case 'generate-observations':
        //     return await addResponse(r.data.agent, r.data.intro);
        case GENERATE_DAY_TASK:
            return await _generateDayTask(r.data);
        case GENERATE_OBSERVATION_TASK:
            return await _generateObservationsTask(r.data);
    }
}

async function initSim(data) {
    const persona = await _getPersona(data.personaId);
    // new sim-run - input
    // title: christmas holiday
    // start date: dec 16
    // number of days: 20
    // steering: (persona based) jimjim gets the bike he wanted
    // steering: (stats) might get a seasonal illness
    // steering: (stats) might achieve a goal
    // days: [] generated
    let simRun = await db.collection("simulation-run").add(data);
    let dates = [];
    for (let i = 0; i < data.numberOfDays; i++) {
        let dt = new Date(data.startDate);
        dt.setDate(dt.getDate() + i);
        dates.push(dt.toISOString().substring(0, 10));
    }
    await _queue(GENERATE_DAY_TASK, {
        simRunId: simRun.id,
        personaId: persona.id,
        dates: dates,
        steering: data.steering
    });
    return simRun.id;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function _generateDayTask(data) {
    let persona = await _getPersona(data.personaId);
    let dayIds = [];
    for (let i=0; i<data.dates.length; i++) {
        let today = data.dates[i];
        let otherDays = [];
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", persona.id)
            .orderBy("date")
            .get();
        querySnapshot.forEach((doc) => {
            otherDays.push({...doc.data(), id: doc.id});
        });
        let dt = new Date(today);
        let dayOfWeek = daysOfWeek[dt.getDay()];
        console.log(today+" "+dayOfWeek+" "+otherDays.length);
        let prompt = processTemplate(S2_DAY, {
            user: JSON.stringify(persona),
            date: today,
            dayOfWeek: dayOfWeek,
            otherDays: JSON.stringify(otherDays)
        });
        let dayData = await callLLM(GEMINI_API_KEY.value(), prompt);
        dayData.personaId = persona.id;
        let writeResult = await db.collection("day").add(dayData);
        dayData.id = writeResult.id;
        dayIds.push(dayData.id);
        for (let i = 0; i < dayData.events.length; i++) {
            await _queue(GENERATE_OBSERVATION_TASK, {
                simRunId: data.simRunId,
                personaId: data.personaId,
                date: today,
                step: i
            });
        }
    }
    return dayIds;
}

async function _generateObservationsTask(data) {
    let persona = await _getPersona(data.personaId);
    let daySnap = await db.collection("day")
        .where("personaId", "==", persona.id)
        .where("date", "==", data.date)
        .get();
    if (daySnap.empty)
        throw new Error("No days for " + persona.id + " " + data.date)
    let day = daySnap.docs[0].data();
    let step = data.step;
    console.log("___________generateObservationsTask", persona.id, step);
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

}

/// html gen

exports.testHTML = functions.https.onRequest({},
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

exports.test1 = functions.https.onRequest({ secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        let htmlresponse = await callLLM(GEMINI_API_KEY.value(), "tell me a joke? return valid json e.g. {joke: ''}");
        console.log(htmlresponse);
        res.set("Content-Type", "application/json");
        res.status(200).send(htmlresponse);
    });