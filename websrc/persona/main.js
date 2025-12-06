"use strict";

import { initNavigation } from "../common/firebasey.js";
import { PersonaListUI, PersonComponent, TextComponent, Component, Button, Select, Input, ImageComponent } from "../common/components.js";
import { DayTabs, ObservationsView } from "../common/observations.js";
import { $, $$ } from "../common/util.js";
import {
    getPersona, listPersona, listDaysPersona, listObservations, createPersona,
    createPersona2, createDayForPersona, runSimulation, processQueue, listUx, getPersonaWithUx
} from "../common/services.js"

const LOG1 = false;

console.log(window.location.pathname);
const urlParams = new URLSearchParams(window.location.search);

initNavigation(user => {
    if (user) {
        $("root").innerText = "";
        switch (document.location.pathname) {
            case '/':
                showHome();
                break;
            case '/add':
                createPersona({}).then(results => {
                    console.log(results)
                    location.href = "persona.html?id=" + results.data.id;
                });
                break;
            case '/add2':
                createPersona2({
                    location: urlParams.get('location'),
                    age: urlParams.get('age'),
                    gender: urlParams.get('gender'),
                    extra: urlParams.get('extra')
                }).then(results => {
                    location.href = "persona.html?id=" + results.data.id;
                });
                break;
            case '/persona.html':
                displayPersona(urlParams.get('id'));
                break;
            case '/sim':
                runSimulation().then(e => {
                    location.href = "/";
                });
                break;
            case '/q':
                processQueue().then(e => {
                    location.href = "/";
                });
                break;
            case '/ux':
                getPersonaWithUx({runName: "test"}).then(e => {
                    console.log(e);
                    let personaList = new PersonaListUI($("root"));
                    let l = [];
                    for (const p in e.data) {
                        l.push(e.data[p]);
                    }
                    personaList.data = l;
               });
                break;

        }
    } else {
        $("root").innerText = "...";
    }
});

let ADMIN = false;

function showHome() {
    let root = new Component($("root"));

    if (ADMIN) {
        let buttonRow = new Component(root, { class: "row-container padded" });
        let addPersona1 = new Button(buttonRow, {}, { text: "Create a random persona" });
        let addPersona2 = new Button(buttonRow, {}, { text: "Guided persona" });
        addPersona1.addListener('click', e => {
            confirmCreateRandomPersona();
        });
        addPersona2.addListener('click', e => {
            showGuidedPersonaInput();
        });
    }

    let controls = new Component(root, { class: "row-container padded" });
    new TextComponent(controls, {}, { text: "Name starts with:" })
    let input = new Input(controls);
    new TextComponent(controls, {}, { text: "Results per page:" })
    let perPage = new Select(controls, ["20", "50", "100"]);
    let personaList = new PersonaListUI(root);

    //
    let listTimeoutId = -1;
    input.addListener("value", e => {
        clearTimeout(listTimeoutId);
        listTimeoutId = setTimeout(doList, 300);
    })

    personaList.addListener("next", e => {
        if (personaList.data.length == 1) {
            input.data = "";
        } else {
            input.data = e;
        }
        doList();
    });
    perPage.addListener("value", e => {
        doList();
    })
    function doList() {
        listPersona({ startAt: input.data, limit: perPage.data }).then(results => {
            if (LOG1) console.log(results)
            personaList.data = results.data;
        });
    }
    doList();

}

const SERVICE_URL = "https://us-central1-aura-persona.cloudfunctions.net/";
// const SERVICE_URL= "http://localhost:5001/aura-persona/us-central1/";

function displayPersona(id) {
    let root = new Component($("root"), { class: "row-container" });
    let personaC = new Component(root);
    personaC.el.style.width = "410px";

    let col2 = new Component(root);
    col2.el.style.maxWidth = "60%"

    let uxC = new Component(col2, { class: "row-container wrap" });
    let dayC = new Component(col2);

    let h = new TextComponent(dayC, { class: "person", el: "h3" }, { text: "Days" });
    let dayTabBar = new Component(dayC, { class: "row-container" });
    let dayObsC = new Component(dayC);

    getPersona({ id: id }).then(persona => {
        if (LOG1) console.log(persona)
        new PersonComponent(personaC, persona.data);
    });
    // listUx({ id: id, runName: "test" }).then(uxes => {
    //     if (LOG1) console.log(uxes);
    //     new ImageBrowser(uxC, uxes.data);
    // });
    listDaysPersona({ id: id }).then(days => {
        console.log(days)
        let maxDay = new Date();
        let dtc = new DayTabs(dayTabBar, {}, days.data);
        dtc.addListener('value', day => {
            if (LOG1) console.log(day);
            listObservations({ id: id, date: day.date }).then(obs => {
                if (LOG1) console.log(obs); //
                dayObsC.clear();
                let o = new ObservationsView(dayObsC, obs.data);
                // o.jsonButton.addListener("click", e => {
                //     let url = SERVICE_URL + "listObservations1?id=" + id + "&date=" + day.date;
                //     window.open(url, '_blank');
                // });
            });
        });

        days.data.forEach(day => {
            // console.log(day.date, new Date(day.date))
            maxDay = Math.max(new Date(day.date), maxDay);
        });
        maxDay = new Date(maxDay);
        maxDay.setDate(maxDay.getDate() + 1);
        let addDay = new Button(dayTabBar, { class: "add-button" }, { text: "Add Day " + (maxDay.getMonth() + 1) + "/" + maxDay.getDate() + "/" + + maxDay.getFullYear() });
        addDay.addListener('click', e => {
            addDay.visible(false);
            createDayForPersona({ date: maxDay, id: id }).then(results => {
                if (LOG1) console.log(results);
                addDay.visible(true);
            });
        });

    });
}


class Takeover extends Component {
    constructor() {
        super(document.body, { class: "takeover" });
        this.body = new Component(this, { class: "body" });
    }
}

function confirmCreateRandomPersona() {
    let root = new Takeover();
    new TextComponent(root.body, { class: "medium-text" }, { text: "This will take 20-30 seconds. When complete, this page will redirect to the new persona page. Click to proceed:" })
    let c = new Component(root.body, { class: "row-container padded" });
    let save = new Button(c, {}, { text: "Proceed" });
    let cancel = new Button(c, {}, { text: "Cancel" });
    save.addListener("click", e => {
        save.enabled(false);
        cancel.enabled(false);
        createPersona().then(results => {
            if (LOG1) console.log(results);
            location.href = "persona.html?id=" + results.data.id;
        });
    });
    cancel.addListener("click", e => {
        root.el.remove();
    });

}

function showGuidedPersonaInput() {
    let root = new Takeover();

    new TextComponent(root.body, { class: "medium-text" }, { text: "Add some details:" })
    new TextComponent(root.body, { class: "padded" }, { text: "Location" });
    let loc = new Input(root.body);
    new TextComponent(root.body, { class: "padded" }, { text: "Age" });
    let age = new Input(root.body);
    new TextComponent(root.body, { class: "padded" }, { text: "Gender" });
    let gender = new Input(root.body);
    new TextComponent(root.body, { class: "padded" }, { text: "Extra" });
    let extra = new Input(root.body);

    let c = new Component(root.body, { class: "row-container padded" });
    let save = new Button(c, {}, { text: "Create" });
    let cancel = new Button(c, {}, { text: "Cancel" });
    save.addListener("click", e => {
        save.enabled(false);
        cancel.enabled(false);
        createPersona2({
            location: loc.data,
            age: age.data,
            gender: gender.data,
            extra: extra.data
        }).then(results => {
            console.log(results)
            location.href = "persona.html?id=" + results.data.id;
        });
    });
    cancel.addListener("click", e => {
        root.el.remove();
    });

}

class ImageBrowser extends Component {
    constructor(parent, data) {
        super(parent, { class: "row-container wrap" });
        data.sort((a, b) => {
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
        data.forEach((ux, idx) => {
            new ImageTile1(this, ux).click(e => { showImage(idx) });
        });
        let t = new Takeover();
        t.visible(false);
        // t.el.addEventListener("click", e => { t.visible(false); })
        function showImage(idx) {
            if (idx == data.length) {
                t.visible(false);
            } else {
                t.visible(true);
                t.body.clear();
                new Button(t.body, {}, {text: "Close"}).click(e=>{ t.visible(false);})
                new ImageTile2(t.body, data[idx]).click(e => { showImage(idx + 1) });
            }
        }
    }


}

class ImageTile1 extends Component {
    constructor(parent, data) {
        super(parent, { class: "" });
        new ImageComponent(this, { width: "80" }, { src: data.url });

    }
}

class ImageTile2 extends Component {
    constructor(parent, data) {
        super(parent, { class: "" });
        console.log(data.data)
        new TextComponent(this, { class: "medium-text" }, { text: data.data.date })
        new TextComponent(this, { class: "" }, { text: data.data.dayPart});
        new TextComponent(this, { class: "" }, { text: data.data.imagePrompt });
        new ImageComponent(this, { width: "900" }, { src: data.url });

    }
}