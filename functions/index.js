if (process.env.FUNCTIONS_EMULATOR === "true") {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
}

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {onSchedule} = require("firebase-functions/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { getDownloadURL } = require("firebase-admin/storage");
const { Firestore } = require("@google-cloud/firestore");
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const { callLLM, processTemplate, sha256, generateImage } = require("./utils.js");

// const path = require('path');
// const { argv, cwd } = require('process');

const {
    randomPersonaPrompt,
    personaPrompt,
    personaImagePrompt,
    getAllUSDemographics,
    getAllJPDemographics,
    S2_DAY,
    S4_LIFE_EVENT,
    S3_AMBIENT_OBSERVATIONS } = require("./prompts/persona.js");
const { S60_LOOM, S60_LOOM_SPACE_CRITIQUE } = require("./prompts/organize.js");

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

exports.createPersona3 = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let usDemo = getAllUSDemographics();
        for (let i = 0; i < usDemo.length; i++) {
            await _queue(GENERATE_PERSONA_TASK, usDemo[i]);
        }
    });

exports.createPersona4 = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let jpDemo = getAllJPDemographics();
        for (let i = 0; i < jpDemo.length; i++) {
            await _queue(GENERATE_PERSONA_TASK, jpDemo[i]);
        }
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
        hobbies: data.hobbies,
        goals_this_week: data.goals_this_week,
        family: data.family,
        apps: data.apps_and_services
        // imageBG: data.imageBG,
    };
}

exports.listPersona = functions.https.onCall({},
    async (request, context) => {
        let personaResponse = [];
        let query = db.collection("persona")
            .orderBy("name")
            .startAt(request.data && request.data.startAt ? request.data.startAt : "A")
            .limit(request.data && request.data.limit ? Number(request.data.limit) : 50);
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

async function _getObservations(personaId, date, start=-1, end=-1) {
    let response = [];
    let querySnapshot = await db.collection("observations")
        .where("personaId", "==", personaId)
        .where("date", "==", date)
        .orderBy("time")
        .get();
    let c = 0;
    querySnapshot.forEach(doc => {
        if ((start == -1 || c >= start) && (end == -1 || c < end)) {
            let d = doc.data();
            d.id = doc.id;
            delete d.personaId;
            response.push(d);
        }
        c++;
    });
    return response;
}

exports.listObservations = functions.https.onCall({},
    async (request, context) => {
        return _getObservations(request.data.id, request.data.date);
    });

exports.listObservations1 = functions.https.onRequest({ cors: true },
    async (request, res) => {
        let response = _getObservations(request.query.id, request.query.date);
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
const GENERATE_PERSONA_TASK = "generate-persona";
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

exports.triggerLifeEvent = functions.https.onCall({ cors: true, secrets: [GEMINI_API_KEY] },
    async (data, context) => {
        let id = data.id;
        let event = data.event;
        let persona = await _getPersona(id);

        let prompt = processTemplate(S4_LIFE_EVENT, {
            user: JSON.stringify(persona),
            event: event
        });
        let updatedPersona = await callLLM(GEMINI_API_KEY.value(), prompt);
        // callLLM already returns the JSON object if successful
        await _getPDoc(id).update(updatedPersona);
        persona = await _getPersona(id); // reload

        // find next date
        let querySnapshot = await db.collection("day")
            .where("personaId", "==", id)
            .orderBy("date", "desc")
            .limit(1)
            .get();

        let nextDate = new Date().toISOString().substring(0, 10);
        if (!querySnapshot.empty) {
            let lastDate = new Date(querySnapshot.docs[0].data().date);
            lastDate.setDate(lastDate.getDate() + 1);
            nextDate = lastDate.toISOString().substring(0, 10);
        }

        let simId = await initSim({
            personaId: id,
            title: event,
            startDate: nextDate,
            numberOfDays: 1,
            steering: "The user's day is significantly impacted by this event: " + event
        });

        _processQ();
        return { simId: simId, persona: persona };
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
    console.log(doc)
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
        case GENERATE_PERSONA_TASK:
            return await _generatePersonaTask(r.data);
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
    let dt = new Date(data.startDate);
    for (let i = 0; i < data.numberOfDays; i++) {
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

async function _generatePersonaTask(data) {
    let p = personaPrompt(data.location, data.age, data.gender, data.extra);
    let personaData = await callLLM(GEMINI_API_KEY.value(), p);
    let newPersona = await db.collection("persona").add(personaData);
    await createImageForAgent(newPersona.id);
    let dates = [];
    let dt = new Date(); // TODO parameterize this
    for (let i = 0; i < 3; i++) {
        dt.setDate(dt.getDate() + i);
        dates.push(dt.toISOString().substring(0, 10));
    }
    await _queue(GENERATE_DAY_TASK, {
        simRunId: newPersona.id,
        personaId: newPersona.id,
        dates: dates,
        steering: ""
    });
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
        let steering = data.steering;
        if (!steering || steering == "") {
            steering = "A typical day should include unexpected diversions, for example a work or family member needing something or a train being delayed or a package delivered to the wrong address. Nothing drastic, realistic.";
        }

        let prompt = processTemplate(S2_DAY, {
            user: JSON.stringify(persona),
            date: today,
            dayOfWeek: dayOfWeek,
            steering: steering,
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

/* SPACE SERVICES */

exports.makeSpaceLoom = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let persona = await _getPersona(request.data.id);
        let sd = await _getObservations(request.data.id, request.data.date, request.data.start, request.data.end);
        // console.log(persona.name);
        // console.log(request.data.date+" "+request.data.start+" "+request.data.end)
        console.log(request.data.priorSpace)

        let prompt = processTemplate(S60_LOOM, {
            user: persona.name,
            observations: JSON.stringify(sd),
            date: request.data.date,
            space: JSON.stringify(request.data.priorSpace.cards),
            memory: JSON.stringify(request.data.priorSpace.memory)
        });
        let spaces = await callLLM(GEMINI_API_KEY.value(), prompt, temp=0.1);
        return spaces;
    });

exports.critiqueSpace = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, context) => {
        let persona = await _getPersona(request.data.id);
        let sd = await _getObservations(request.data.id, request.data.date, request.data.start, request.data.end);
        let prompt = processTemplate(S60_LOOM_SPACE_CRITIQUE, {
            persona: JSON.stringify(persona),
            observations: JSON.stringify(sd),
            date: request.data.date,
            space: JSON.stringify(request.data.priorSpace.cards),
            memory: JSON.stringify(request.data.priorSpace.memory)
        });
        let critique = await callLLM(GEMINI_API_KEY.value(), prompt, temp=1.3);
        return critique;
    });


exports.createEditorialImg = functions.https.onCall({ secrets: [GEMINI_API_KEY] },
    async (request, res) => {
        let prompt = String(request.data.prompt);
        let filepath = "/editorial-2/" + sha256(prompt) + ".jpg";
        console.log(filepath);
        const file = bucket.file(filepath);
        const exists = await file.exists();
        if (!exists[0]) {
            // let content = "Make a very simple graphic illustration in the style of Sebastian Curi for: " + prompt + ". ";
            // console.log(content)
            const buffer = await generateImage(GEMINI_API_KEY.value(), prompt);
            await file.save(buffer);
        }
        const downloadURL = await getDownloadURL(file);
        return { url: downloadURL };
    }
);