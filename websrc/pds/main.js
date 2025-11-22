"use strict";

// import { initNavigation } from "../common/firebasey.js";
import { PersonaListUISmall, PersonComponentSmall, Component, Button } from "../common/components.js";
import { DayTabsSmall, ObservationsView } from "../common/observations.js";
import { $ } from "../common/util.js";
import { listDaysPersona, listObservations, makeSpacePds, listPersona, createAppImg } from "../common/services.js"
import { Jaime, Jaime2 } from "../common/test.js"
import { SpacesComponent } from "./spaces.js"

const LOG1 = true;

let root = new Component($("spaces"));
let controls = new Component($("controls"));

document.fonts.ready.then(() => {
    doListPersona();
    // listObservations({ id: Jaime.id, date: Jaime.date }).then(obs => {
    //     obs = obs.data;
    //     let obsMap = {};
    //     obs.forEach(o => { obsMap[o.id] = o; })
    //     new SpacesComponent($("spaces"), Jaime2, obsMap);
    // });      
    createAppImg({app:"doodah"}).then(d=>{
        console.log(d);
    })
});

function doListPersona() {
    listPersona().then(results => {
        if (LOG1) console.log(results)
        let personaList = new PersonaListUISmall(controls);
        personaList.data = results.data;
        personaList.addListener('value', persona => {
            listDaysPersona({ id: persona.id }).then(days => {
                days = days.data;
                personaList.visible(false);
                let personaItem = new Component(controls);
                let personaHeader = new PersonComponentSmall(personaItem, persona);
                personaHeader.back.click(e => {
                    personaList.visible(true);
                    personaItem.remove();
                });
                let dayBB = new DayTabsSmall(personaHeader.daysContainer, {}, days);
                dayBB.addListener("value", day => {
                    showDay(personaItem, persona, day);
                });
                if (days.length != 0) {
                    showDay(personaItem, persona, days[0]);
                }
            });
        });
    });
}

let lastObsView = null;
function showDay(p, persona, day) {
    if (persona.imageBG) {
        let bg = new Image();
        // bg.crossOrigin = 'anonymous';
        bg.src = persona.imageBG;
        bg.onload = () => {
            $("phoneBg").style.backgroundImage = "url(" + persona.imageBG + ")";
            // let x = colorThief.getPalette(bg);
            // console.log(x);
        }
    }
    listObservations({ id: persona.id, date: day.date }).then(obs => {
        obs = obs.data;
        if (lastObsView) lastObsView.remove();
        let obsMap = {};
        obs.forEach(o => { obsMap[o.id] = o; })
        let obsView = new ObservationsView(p, obs);
        lastObsView = obsView;
        let spaceBtn = new Button(p, {}, { text: "Generate Space" })
        spaceBtn.addListener("click", e => {
            $("spaces").innerText = "";
            spaceBtn.visible(false);
            // const shortObs = obs.slice(obsView.slider.data.min, obsView.slider.data.max);
            makeSpacePds({
                id: persona.id,
                date: day.date,
                start: obsView.slider.data.min,
                end: obsView.slider.data.max
            }).then(organized => {
                spaceBtn.visible(true);
                console.log(organized)
                new SpacesComponent($("spaces"), organized.data.greeting, day.date, organized.data.spaces, obsMap);
            });
        });
    });
}