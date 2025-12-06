"use strict";

// import { initNavigation } from "../common/firebasey.js";
import { PersonaListUISmall, PersonComponentSmall, Component, Button, ImageComponent, Select } from "../common/components.js";
import { DayTabsSmall, ObservationsView } from "../common/observations.js";
import { $ } from "../common/util.js";
import { listDaysPersona, listObservations, listPersona, makeSpaceBanaux } from "../common/services.js"
import { Jaime, Jaime2 } from "../common/test.js"

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
    // createAppImg({app:"doodah"}).then(d=>{
    //     console.log(d);
    // })
});

function doListPersona() {
    listPersona({limit: 50}).then(results => {
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
    
    listObservations({ id: persona.id, date: day.date }).then(obs => {
        obs = obs.data;
        if (lastObsView) lastObsView.remove();
        let obsMap = {};
        obs.forEach(o => { obsMap[o.id] = o; })
        let obsView = new ObservationsView(p, obs);
        lastObsView = obsView;
        let spaceBtn = new Button(p, {}, { text: "Generate Space" })
        let select = new Select(p, ["pds-1.png", "mira-image.png", "mira-visd.png", "mira-visd-1.png", 
            "mira-visd-2.png", "mira-system-1.png", "kiki.png", "1818.png", 
            "gemspace-1.png", "gemspace-2.png", "subzero-1.png"]);
        spaceBtn.addListener("click", e => {
            $("spaces").innerText = "";
            spaceBtn.enabled(false);
            // const shortObs = obs.slice(obsView.slider.data.min, obsView.slider.data.max);
            makeSpaceBanaux({
                id: persona.id,
                date: day.date,
                start: obsView.slider.data.min,
                end: obsView.slider.data.max,
                template: select.data
            }).then(r => {
                spaceBtn.enabled(true);
                console.log(r)
                new ImageComponent($("spaces"), {}, {src: r.data.url})
            });
        });
    });
}