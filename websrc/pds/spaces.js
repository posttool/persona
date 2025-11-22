import { Component, TextComponent, Button, ImageComponent } from "../common/components.js";
import { createAppImg } from "../common/services.js";

function getObservationString(data) {
    if (data == null)
        return "";
    let t = data.time + " / " + data.device + " / " + data.type;
    if (data.senderApp) {
        t += " / " + data.senderApp;
    }
    return t;
}


export class SpacesComponent extends Component {
    constructor(parent, headline, date, spaces, observationMap = {}) {
        super(parent, { class: 'spaces ' });
        this.headline = new TextComponent(this, { class: "time1" }, { text: headline });
        this.time = new TextComponent(this, { class: "time2" }, { text: "Fri Oct 22 ☀️ 76° F" });
        // let spacesComponent = new Component(this);
        // let spaceComponent = new Component(this);
        let maxTime = "00:00";
        spaces.forEach(space => {
            // console.log(space)
            if (space.relatedObservations) {
                space.relatedObservations.forEach(obsId => {
                    let task = observationMap[obsId];
                    if (task != null) {
                        maxTime = task.time > maxTime ? task.time : maxTime;
                    }
                });
            }
        });
        // this.time.data = { text: maxTime }; // TBD!!!
        let c =new Component(this, {class: "row-container wrap"});
        let idx = 0;
        spaces.forEach(space => {
            let sc = new SpaceComponent(c, space, observationMap);
            idx++;
            if (idx == 2 || idx == 3) {
                sc.el.style.width = "47%";
            }
        });
    }
}

class SpaceComponent extends Component {
    constructor(parent, space, observationMap) {
        super(parent, { class: 'space' });
        this.lastUpdate = -1;

        new TextComponent(this, { class: "space-subject" }, { text: space.subject });
        new TextComponent(this, { class: "space-reason" }, { text: space.tracking.reason });
        if (space.tracking.expires && space.tracking.expires != "N/A")
            new TextComponent(this, { class: "pill " }, { text: space.tracking.expires });
 
        //  if (space.tracking.actions)
        //     new ButtonRow(this, space.tracking.actions);

 
        //     new TextComponent(this, { class: "pill blue " }, { text: space.relatedObservations.length });

        
        // new GeneratedImage(col2,{class:"rounded"},
        //     "Pick a key element of this info and create a pencil drawing. Do not include people: "+space.tracking.reason);

        // if (space.tracking) {
        //     if (false || space.tracking.reason)
        //         new TextComponent(col1, {}, { text: space.tracking.reason });
        //     if (space.tracking.expires)
        //         new TextComponent(this, { class: "pill" }, { text: space.tracking.expires });
        //     if (false || space.tracking.actions)
        //         new ButtonRow(this, space.tracking.actions);
        // }
    }
}

//Mother and Mwape have requested you check on Mizinga, go to the market, and pick up bread after school.

class SpaceComponentExtended extends Component {
    constructor(parent, space, observationMap) {
        super(parent, { class: 'space-card' });
        this.title = new TextComponent(this, { class: "medium-text padded" }, { text: space.subject });
        if (space.tracking.expires && space.tracking.expires != "N/A")
            new TextComponent(this, { class: "padded bold" }, { text: space.tracking.expires });
        new TextComponent(this, { class: "padded" }, { text: space.tracking.reason });
        if (space.tracking.actions)
            new ButtonRow(this, space.tracking.actions);

        let sname = new TextComponent(this, { class: "small-text padded " }, { text: space.name });
        let t = new TextComponent(this, { class: "small-text" }, { text: "Details" });
        let related = new Component(this, { class: "obs-container" });
        related.visible(false);
        t.click(e => {
            console.log(related.isVisible)
            related.visible(!related.isVisible);
        })
        space.relatedObservations.forEach(obsId => {
            let task = observationMap[obsId];
            if (task != null) {
                let taskContainer = new Component(related, { class: "obs-item" });
                new TextComponent(taskContainer, { class: 'small-text grey' }, { text: getObservationString(task) });
                new TextComponent(taskContainer, { class: 'small-text' }, { text: task.data });
            }
        })

    }
}

class ButtonRow extends Component {
    constructor(parent, actions) {
        super(parent, { class: '' });
        if (actions) {
            actions.forEach(a => {
                let t = new AppAction(this, a);
            });
        }
    }

}


class AppAction extends Component {
    constructor(parent, action) {
        super(parent, {});
        let t1 = new Button(this, { class: "small-button" }, { text: action.intent });
        let i = new ImageComponent(t1.el, { width: 32, class: "app-icon" });
        createAppImg({app: action.app}).then(obj => {
            console.log(obj)
            i.data = { src: obj.data.url };
        });



                // if (Object.keys(action.data).length != 0) {
        //     let t2 = new SimpleActionComponent(c, action);
        // }

        // c.click(e => {
        //     console.log(action);
        // })

    }
}

class LLMComponent extends Component {
    constructor(parent, action) {
        super(parent, { class: '' });
        let root = this;
        let prompt = "Make a UI for this data: " + JSON.stringify(action.data) + "\n" + UI_COACHING;
        callDefaultLLM(prompt, document => {
            drawForm(root, document);
        });
    }
}

class SimpleActionComponent extends Component {
    constructor(parent, action) {
        super(parent, { class: '' });
        for (let p in action.data) {
            let t1 = new TextComponent(this, { class: "grey" }, { text: p });
            let t2 = new TextComponent(this, { class: "padded" }, { text: action.data[p] });
        }
    }
}