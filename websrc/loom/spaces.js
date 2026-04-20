import { Component, TextComponent, Button, ImageComponent } from "../common/components.js";
import { createAppImg } from "../common/services.js";



export class SpacesComponent extends Component {
    constructor(parent, data, date, time) {
        super(parent, { class: 'spaces' });
        this.headline = new TextComponent(this, { class: "time1" }, { text: data.greeting });
        this.time = new TextComponent(this, { class: "time2" }, { text: date + " " + time });
        // let spacesComponent = new Component(this);
        let cards = new Component(this, { class: 'cards' });
        let maxTime = "00:00";
        data.cards.forEach(card => {
            switch (card.type) {
                case "BASIC":
                    new BasicCard(cards, card);
                    break;
                case "TODO":
                    new TodoCard(cards, card);
                    break;
                case "MESSAGE":
                    new MessageCard(cards, card);
                    break;
                case "MESSAGE_GROUP":
                    new MessageGroupCard(cards, card);
                    break;
                case "GOAL":
                    new GoalCard(cards, card);
                    break;
                case "APP_GROUP":
                    new AppsCard(cards, card);
                    break;
                case "EVENT":
                    new EventCard(cards, card);
                    break;
                case "SCHEDULE":
                    new ScheduleCard(cards, card);
                    break;
                default:
                    console.log("UNKNOWN CARD TYPE [" + card.type + "]")
                    break;
            }

        });
    }
}

export class MemoryComponent extends Component {
    constructor(parent, memory) {
        super(parent, { class: "memory" });
        new TextComponent(this, {class:"big-text"}, { text: "For later" });
        let t = new Component(this, { el: "table" });
        memory.forEach(mem => {
            let r = new Component(this, { el: "tr", class: "top-aligned-cell" });
            let c1 = new Component(this, { el: "td", class: "small-text", text: mem.title })
            let c2 = new Component(this, { el: "td", class: "small-text" })
            new TextComponent(c2, {}, { text: mem.reason });
            mem.triggers.forEach(t => {
                new TextComponent(c2, {}, { text: t.type + " " + JSON.stringify(t.content) });
            })
            // mem.relatedData.forEach(d => {
            //     new TextComponent(c2, {}, { text: d });
            // })
        })
    }
}


export class CritiqueComponent extends Component {
    constructor(parent, crit) {
        super(parent, { class: "memory" });
        new TextComponent(this, {class:"big-text"}, { text: "Critique" });
        new TextComponent(this, {class:"small-text"}, { text: crit.critique });
        new TextComponent(this, {class:"small-text"}, { text: "GOOD: "+crit.good });
        new TextComponent(this, {class:"small-text"}, { text: "BAD: "+crit.bad });
        new TextComponent(this, {class:"small-text"}, { text: "TRUST: "+crit.trust });
        new TextComponent(this, {class:"small-text"}, { text: "MANUAL: "+crit.manual });
    }
}

class BasicCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card basic' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        new TextComponent(this, { class: "text" }, { text: card.content.text });
    }
}

class TodoCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card todo' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        card.content.items.forEach(e => {
            let c = new Component(this, { class: "item row-container" });
            new TextComponent(c, { class: "text" }, { text: e.text });
            if (!e.isCompleted) {
                let mc = new Component(c, { class: "check-box", el: "span" });
                new Component(mc, { class: "material-symbols-outlined", el: "span", text: "check" });
            }
        });
    }
}

class MessageCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card message' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        // new TextComponent(this, { class: "text" }, { text: card.content.message });
        new Message(this, card.content);
    }
}

function getAppPrompt(appName) {
    return `A flat vector app icon of ${appName}, lighting: glossy, background: simple, 1024x1024, minimalist design --no text, make sure the icon takes up the entire image and that the color goes edge to edge so it can be cropped effectively.`
}
function getSelfiePrompt(name){
    return `A casual photograph or selfie shot on an phone of the following person. Name: ${name}`;
}

class Message extends Component {
    constructor(parent, m) {
        super(parent, { class: 'bestie-container' });
        let sa = new Component(this, { class: "selfie-and-app" });
        new GenerativeImage(sa, getSelfiePrompt(m.sender), { class: "avatarphotography_01" });
        new GenerativeImage(sa, getAppPrompt(m.appName), { class: "message-apps_01" });
        let msgc1 = new Component(this, { class: "msg_01" })
        let msgc2 = new Component(msgc1, { class: "frame-01-bubble_01" });
        let msgc3 = new Component(msgc2, { class: "subtitle_01" });
        new TextComponent(msgc3, { el: "span", class: "subtitle_01_span" }, { text: m.message });
    }
}

class MessageGroupCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card message-group' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        let bc = new Component(this, { class: "bestie-favs" });
        card.content.messages.forEach(m => {
            // console.log(m);
            new Message(bc, m);
        });
    }
}

class GoalCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card goal' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        new TextComponent(this, { class: "text" }, { text: card.content.description });
    }
}

class EventCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card event' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        new TextComponent(this, { class: "big-text" }, { text: card.content.time });
    }
}

class ScheduleCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card schedule' });
        new TextComponent(this, { class: "subject" }, { text: card.content.title });
        card.content.events.forEach(m => {
            let c = new Component(this, { class: "message row-container" + (m.isTentative ? " tentative" : "") });
            new TextComponent(c, { class: "time" }, { text: m.time });
            new TextComponent(c, { class: "event" }, { text: m.title });
        });
    }
}

class AppsCard extends Component {
    constructor(parent, card) {
        super(parent, { class: 'card apps row-container' });
        card.content.appNames.forEach(appName => {
            let c = new Component(this, { class: "item" });
            new GenerativeImage(c, getAppPrompt(appName), { class: "app-circle" });
        });
    }
}


import { createEditorialImg } from "../common/services.js";
class GenerativeImage extends ImageComponent {
    constructor(parent, prompt, options = {}) {
        super(parent, options);
        createEditorialImg({ prompt: prompt }).then(e => {
            this.data = { src: e.data.url };
        });
    }
    draw() {
        super.draw();
    }
}


/* unused */


class SpaceComponent extends Component {
    constructor(parent, space, observationMap) {
        super(parent, { class: 'space' });
        this.lastUpdate = -1;

        if (space.tracking.expires && space.tracking.expires != "N/A") {
            new GenerativeImage(this, space.subject + " - " + space.tracking.reason);
            new TextComponent(this, { class: "space-pill " }, { text: space.tracking.expires });
        }
        let padded = new Component(this, { class: "padded" })
        new TextComponent(padded, { class: "space-subject" }, { text: space.subject });
        new TextComponent(padded, { class: "space-reason" }, { text: space.tracking.reason });

        if (space.tracking.actions)
            new ButtonRow(padded, space.tracking.actions);


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



function getObservationString(data) {
    if (data == null)
        return "";
    let t = data.time + " / " + data.device + " / " + data.type;
    if (data.senderApp) {
        t += " / " + data.senderApp;
    }
    return t;
}


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
        super(parent, { class: 'row-container' });
        if (actions) {
            actions.forEach(a => {
                let t = new AppAction(this, a);
            });
        }
    }
}

class AppAction extends Component {
    constructor(parent, action) {
        super(parent, { class: "pds-button-1" });
        let i = new ImageComponent(this, { width: 32, class: "app-icon" });
        let t1 = new TextComponent(this, { class: "label" }, { text: action.intent });
        createAppImg({ app: action.app }).then(obj => {
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