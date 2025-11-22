"use strict";

import { initNavigation } from "../common/firebasey.js";
import { PersonaListUI, PersonComponent, TextComponent, Component, Button } from "../common/components.js";
import { DayTabs, ObservationsView } from "../common/observations.js";
import { $ } from "../common/util.js";
import { getPersona, listDaysPersona, listObservations, createDayForPersona, listPersona } from "../common/services.js"

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
                    showHome();
                });
                break;
            case '/add2':
                createPersona2({
                    location: urlParams.get('location'),
                    age: urlParams.get('age'),
                    gender: urlParams.get('gender'),
                    extra: urlParams.get('extra')
                }).then(results => {
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

const SERVICE_URL = "https://us-central1-aura-persona.cloudfunctions.net/";
// const SERVICE_URL= "http://localhost:5001/aura-persona/us-central1/";

function displayPersona(id) {
    let root = new Component($("root"), { class: "row-container" });
    let personaC = new Component(root);
    personaC.el.style.width = "410px";
    let dayC = new Component(root);
    dayC.el.style.maxWidth = "50%"
    let h = new TextComponent(dayC, { class: "person", el: "h3" }, { text: "Days" });
    let dayTabBar = new Component(dayC, { class: "row-container" });
    let dayObsC = new Component(dayC);

    getPersona({ id: id }).then(persona => {
        if (LOG1) console.log(persona)
        new PersonComponent(personaC, persona.data);
    })
    listDaysPersona({ id: id }).then(days => {
        if (LOG1) console.log(days)
        let maxDay = new Date();
        let dtc = new DayTabs(dayTabBar, {}, days.data);
        dtc.addListener('value', day => {
            if (LOG1) console.log(day);
            listObservations({ id: id, date: day.date }).then(obs => {
                if (LOG1) console.log(obs); //
                dayObsC.clear();
                let o = new ObservationsView(dayObsC, obs.data);
                o.jsonButton.addListener("click", e => {
                    let url = SERVICE_URL + "listObservations1?id=" + id + "&date=" + day.date;
                    window.open(url, '_blank');
                });
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