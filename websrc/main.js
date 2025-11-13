"use strict";

import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { initNavigation } from "./firebasey.js";
import {
    PersonaListUI, PersonComponent, MomentsContainer,
    TextComponent, RangeInput, Component, Button
} from "./components.js";
import { $ } from "./util.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSff1RU2_hcEjtJtCS_uloSgbbYrnaoLI",
    authDomain: "aura-persona.firebaseapp.com",
    projectId: "aura-persona",
    storageBucket: "aura-persona.firebasestorage.app",
    messagingSenderId: "643081543085",
    appId: "1:643081543085:web:81772b8e4beddf8aa2d524"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

const LOG1 = false;

if (window.location.hostname.includes("localhost")) {
    console.log("USING EMULATOR!")
    // connectFirestoreEmulator(getFirestore(), "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
}

const createPersona = httpsCallable(functions, "createPersona");
const listPersona = httpsCallable(functions, "listPersona");
const getPersona = httpsCallable(functions, "getPersona");
const createDayForPersona = httpsCallable(functions, "createDayForPersona");
const listDaysPersona = httpsCallable(functions, "listDaysForPersona");
const listObservations = httpsCallable(functions, "listObservations");

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
                    showHome();
                });
                break;
            case '/persona.html':
                displayPersona(urlParams.get('id'));
                break;
        }
    } else {
        $("root").innerText = "...";
    }
});


function showHome() {
    let root = new Component($("root"));
    let personaList = new PersonaListUI(root);
    // let addPersona = new Button(root, {}, { text: "Add" });
    // addPersona.addListener('click', e => {
    //     addPersona.visible(false);
    //     createPersona({}).then(results => {
    //         if (LOG1) console.log(results);
    //         addPersona.visible(true);
    //         doList();
    //     })
    // });
    function doList() {
        listPersona().then(results => {
            if (LOG1) console.log(results)
            personaList.data = results.data;
        });
    }
    doList();
}

function displayPersona(id) {
    let root = new Component($("root"));
    let personaC = new Component(root);
    new TextComponent(root, { class: "person", el: "h3" }, { text: "Days" });
    let dayBB = new Component(root, { class: "row-container" });
    let organizeBB = new Component(root, { class: "row-container" });
    organizeBB.visible(false);
    let startSlider = new RangeInput(organizeBB, { class: "" });
    let amountSlider = new RangeInput(organizeBB, { class: "" }, 21);
    let dayC = new Component(root);

    let selectedDay = null;
    let observationView = null;
    let obsMap = null;

    getPersona({ id: id }).then(persona => {
        if (LOG1) console.log(persona)
        new PersonComponent(personaC, persona.data);
    })
    listDaysPersona({ id: id }).then(days => {
        if (LOG1) console.log(days)
        let maxDay = new Date();
        days.data.forEach(day => {
            // console.log(day.date, new Date(day.date))
            maxDay = Math.max(new Date(day.date), maxDay);
            let t = new Button(dayBB, { class: "tab-button" }, { text: day.date });
            t.addListener('click', e => {
                if (LOG1) console.log(day);
                selectedDay = day;
                dayBB.children.forEach(b => {
                    if (b == t)
                        b.el.classList.add("selected");
                    else
                        b.el.classList.remove("selected");
                })
                listObservations({ id: id, date: day.date }).then(obs => {
                    console.log(obs); //if (LOG1) 
                    organizeBB.visible(true);
                    obsMap = {};
                    obs.data.forEach(o => {
                        obsMap[o.id] = o;
                    })
                    dayC.clear();
                    observationView = new MomentsContainer(dayC, obs.data);
                    observationView.show(startSlider.data, amountSlider.data);
                    startSlider.max = obs.data.length - 1;
                });

            });
        });
        maxDay = new Date(maxDay);
        maxDay.setDate(maxDay.getDate() + 1);
        let addDay = new Button(dayBB, { class: "add-button" }, { text: "Add Day " + (maxDay.getMonth() + 1) + "/" + maxDay.getDate() + "/" + + maxDay.getFullYear() });
        addDay.addListener('click', e => {
            addDay.visible(false);
            createDayForPersona({ date: maxDay, id: id }).then(results => {
                if (LOG1) console.log(results);
                addDay.visible(true);
            });
        });
        startSlider.addListener('change', v => {
            observationView.show(startSlider.data, amountSlider.data);
        })
        amountSlider.addListener('change', v => {
            observationView.show(startSlider.data, amountSlider.data);
        })

    });

}