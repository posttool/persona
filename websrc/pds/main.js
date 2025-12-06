"use strict";

import { $ } from "../common/util.js";
import { Jaime, Jaime2 } from "../common/test.js"
import { PersonaListUISmall, PersonComponentSmall, Component, Button } from "../common/components.js";
import { DayTabsSmall, ObservationsView } from "../common/observations.js";
import { listDaysPersona, listObservations, makeSpacePds, listPersona, createAppImg } from "../common/services.js"
import { SpacesComponent } from "./spaces.js"

const LOG1 = true;

let root = new Component($("spaces"));
let controls = new Component($("controls"));

function getObsMap(data) {
    let obsMap = {};
    data.forEach(o => { obsMap[o.id] = o; })
    return obsMap;
}
document.fonts.ready.then(() => {
    doListPersona();
    // listObservations({ id: Jaime.id, date: Jaime.date }).then(obs => {
    //     let obsMap = getObsMap(obs.data);
    //     new SpacesComponent($("spaces"), Jaime2, obsMap);
    // });      
    // createAppImg({app:"doodah"}).then(d=>{
    //     console.log(d);
    // })
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
        }
    }
    listObservations({ id: persona.id, date: day.date }).then(obs => {
        obs = obs.data;
        if (lastObsView) lastObsView.remove();
        let obsMap = getObsMap(obs);
        let obsView = new ObservationsView(p, obs);
        obsView.filterTypes.visible(false);
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
                console.log(organized);
                new SpacesComponent(
                    $("spaces"), 
                    organized.data, 
                    day.date, 
                    obsMap);
            });
        });
    });
}