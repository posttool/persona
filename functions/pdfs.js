const PDFDocument = require('pdfkit');
const {processTemplate, getUrlBytes } = require("./utils.js");
const { BANAUX_P1, BANAUX_P2 } = require("./prompts/genux-banaux.js");

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

async function makePdf1(runName) {
        const doc = new PDFDocument({ layout: "landscape" });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const morepath = Math.floor(Math.random() * 10000000000);
            const file = bucket.file("pdf/" + runName + "/" + morepath + ".pdf");
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
                .text("Run name: " + runName)
                .fontSize(12)
                .text((new Date()).toString());
            // date

            let persona = await _getPersonaWithUx(runName);
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
                    .where("runName", "==", runName)
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

    };



async function runSimulation1(name) {
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
    
    exports.makePdf = functions.https.onCall({ cors: true, secrets: [] },
        async (request, context) => {
        });
    // exports.scheduledFunction = functions
    //     .runWith({ secrets: [GEMINI_API_KEY] })
    //     .pubsub.schedule('* * * * *').onRun((context) => {
    //         functions.logger.info('On the minute * * * * * !');
    //         return _processQ();
    //     });
    
    async function generateScreen(data) {
        let sd = await getObservations(data.id, data.date, data.start, data.end);
        // let sd = await getObservations(request.data.id, request.data.date, request.data.start, request.data.end)
        let prompt = processTemplate(S42_ORGANIZE_AND_TRACK_PDS, {
            user: sd.persona.name,
            observations: JSON.stringify(sd.observations),
            date: data.date
        });
        console.log("getting space")
        let spaces = await _callLLM(prompt);
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
    