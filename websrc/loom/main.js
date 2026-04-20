"use strict";

import { $ } from "../common/util.js";
import { Component, Button, TextComponent, PersonaListUISmall, PersonComponentSmall } from "../common/components.js";
import { DayTabsSmall, ObservationsView } from "../common/observations.js";
import { listDaysPersona, listObservations, listPersona, getPersona, makeSpaceLoom, critiqueSpace } from "../common/services.js"
import { SpacesComponent, MemoryComponent, CritiqueComponent } from "./spaces.js"

const LOG1 = true;
const urlParams = new URLSearchParams(window.location.search);


let controls = new Component($("controls"));
let controlHeader = new Component(controls);
let controlObservations = new Component(controls);
let controlMemory = new Component(controls, { class: "memory-container" });
let controlCritique = new Component(controls, { class: "critique-container" });
let controlButtons = new Component(controls, { class: "button-container" });

function getObsMap(data) {
    let obsMap = {};
    data.forEach(o => { obsMap[o.id] = o; })
    return obsMap;
}
document.fonts.ready.then(() => {
    const pid = urlParams.get('id');
    if (pid) {
        getPersona({ id: pid }).then(persona => {
            doGetPersona(persona.data);
        })
    } else {
        doListPersona();
    }

});

function doListPersona() {
    listPersona().then(results => {
        if (LOG1) console.log(results)
        let personaList = new PersonaListUISmall(controls);
        personaList.data = results.data;
        personaList.addListener('value', persona => {
            personaList.visible(false);
            doGetPersona(persona);
        });
    });
}


function doGetPersona(persona) {
    listDaysPersona({ id: persona.id }).then(days => {
        days = days.data;
        let personaContainer = new Component(controlHeader);
        let personaHeader = new PersonComponentSmall(personaContainer, persona);
        personaHeader.back.click(e => {
            history.back();
        });
        let dayBB = new DayTabsSmall(personaHeader.daysContainer, {}, days);
        dayBB.addListener("value", day => {
            showDay(persona, day);
        });
        if (days.length != 0) {
            showDay(persona, days[0]);
        }
    });
}


function showDay(persona, day) {
    if (persona.imageBG) {
        let bg = new Image();
        bg.src = persona.imageBG;
        bg.onload = () => {
            $("phoneBg").style.backgroundImage = "url(" + persona.imageBG + ")";
        }
    }
    listObservations({ id: persona.id, date: day.date }).then(obs => {
        obs = obs.data;
        controlObservations.clear();
        controlButtons.clear();
        // let obsMap = getObsMap(obs);
        let priorSpace = {};
        let obsView = new ObservationsView(controlObservations, obs);
        obsView.filterTypes.visible(false);
        let spaceBtn = new Button(controlButtons, {}, { text: "Generate Space" });
        let critiqueBtn = null;
        spaceBtn.addListener("click", e => {
            spaceBtn.visible(false);
            if (critiqueBtn) critiqueBtn.visible(false);
            const shortObs = obs.slice(obsView.slider.data.min, obsView.slider.data.max);
            let time = shortObs[shortObs.length - 1].time;
            makeSpaceLoom({
                id: persona.id,
                date: day.date,
                start: obsView.slider.data.min,
                end: obsView.slider.data.max,
                priorSpace: priorSpace
            }).then(organized => {
                priorSpace = organized.data;
                console.log(priorSpace);
                critiqueBtn = new Button(controlButtons, {}, { text: "Critique Space" });
                spaceBtn.visible(true);
                $("spaces").innerText = "";
                controlMemory.clear();
                new SpacesComponent($("spaces"), organized.data, day.date, time);
                new MemoryComponent(controlMemory, organized.data.memory);
                critiqueBtn.addListener("click", e => {
                    critiqueBtn.visible(false);
                    controlCritique.clear();
                    critiqueSpace({
                        id: persona.id,
                        date: day.date,
                        start: obsView.slider.data.min,
                        end: obsView.slider.data.max,
                        priorSpace: priorSpace
                    }).then(critique => {
                        critiqueBtn.visible(true);
                        new CritiqueComponent(controlCritique, critique.data );
                    });
                })
            });
        });
    });
}