import { $, $$ } from "./util.js";

// let FB_CONFIG = null;
// export function initComponents(config) {
//     FB_CONFIG = config;
// }
// function getStorageUrl(path) {
//     return FB_CONFIG(path);
// //   if (!path)
// //     return '';
// //   if (path.indexOf('http') == 0)
// //     return path;
// //   return 'https://storage.googleapis.com/' + FB_CONFIG.storageBucket + '/' + path;
// }


export class Component {
    constructor(parent = null, options = {}) {
        this.children = [];
        this.listeners = {};
        this.el = $$(options);
        this._data = null;
        if (parent != null) {
            if (parent instanceof Component) {
                parent.addChild(this, options.addAtIndex);
            } else {
                parent.appendChild(this.el);
            }
        }
    }

    draw() {
    }

    set data(data) {
        this._data = data;
        this.draw();
    }

    get data() {
        return this._data;
    }

    visible(b, el = null) {
        if (el == null)
            el = this.el;
        el.style.display = b ? '' : 'none';
    }

    addChild(component, idx) {
        component.parent = this;
        if (idx == null) {
            this.children.push(component);
            this.el.appendChild(component.el);
        } else {
            this.children.splice(idx, 0, component);
            this.el.insertBefore(component.el, this.el.childNodes[idx]);
        }
    }

    remove(c) {
        if (c == null) {
            this.parent.remove(this);
        } else {
            c.el.remove();
            var idx = this.children.indexOf(c);
            if (idx == -1) {
                return;
            }
            this.children.splice(idx, 1);
        }
    }

    addListener(type, func) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(func);
    }

    emit(type, value) {
        var funcs = this.listeners[type];
        if (funcs) {
            for (var i = 0; i < funcs.length; i++) {
                funcs[i](value, this);
            }
        }
    }

    clear() {
        this.el.innerText = '';
        this.children = [];
    }

    clickable() {
        if (!this._clickableInit) {
            this.el.addEventListener("click", this.emit.bind(this, "click"));
            this._clickableInit = true;
        }
    }

    click(f) {
        this.clickable();
        this.addListener("click", f);
    }

}


export class TextComponent extends Component {
    constructor(parent, options, data) {
        super(parent, options);
        if (data) {
            this.data = data
        } else {
            this.data = { text: "" };
        };
    }

    draw() {
        if (this._data) {
            this.el.innerText = this._data.text;
        }
    }
}
export class PersonaListUI extends Component {
    constructor(parent, options) {
        super(parent, { class: "row-container", ...options });
    }
    draw() {
        // console.log(this._data);
        this.clear();
        this._data.forEach(p => {
            new PersonTile(this, p).click(e => {
                document.location.href = "/persona.html?id=" + p.id;
            });
        })
    }
}

class PersonTile extends Component {
    constructor(parent, p) {
        super(parent, {});
        new ImageComponent(this, { class: "rounded" }, {src: p.image});
        new TextComponent(this, { class: "width-150" }, { text: p.name });
    }
}


export class PersonComponent extends Component {
    constructor(parent, data) {
        super(parent, {});
        new TextComponent(this, { class: "person", el: "h2" }, { text: data.name + ", " + data.age });
        new ImageComponent(this, { class: "rounded", width: "400" }, {src: data.image});
        new TextComponent(this, { class: "person" }, { text: data.occupation });
        new TextComponent(this, { class: "person" }, { text: data.city });
        new TextComponent(this, { class: "person", el: "h3" }, { text: "Apps & Services" });
        data.apps_and_services.forEach(a => {
            new TextComponent(this, { class: "small-text line-height-18" }, { text: a.app }); // + ": " + a.usage
        })



        if (false) {
            new TextComponent(this, { class: "person", el: "h2" }, { text: "Family" });
            data.family.forEach(f => {
                new TextComponent(this, { class: "family-member" }, { text: f.name + ": " + f.relation });
            })
            new TextComponent(this, { class: "person", el: "h2" }, { text: "Apps & Services" });
            data.apps_and_services.forEach(a => {
                new TextComponent(this, { class: "family-member" }, { text: a.app + ": " + a.usage });
            })
            // new TextComponent(parent, {class:"person"}, {text: JSON.stringify(data.hobbies)});
        }
    }

}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
function getNowSeconds() {
    return timeStringToSeconds(formatTime(new Date()));
}
function timeStringToSeconds(timeString) {
    if (!timeString) {
        return 0;
    }
    const parts = timeString.split(':');
    if (parts.length !== 3) {
        return 0;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return 0;
    }

    return (hours * 3600) + (minutes * 60) + seconds;
}

function secondsToTimeString(totalSeconds) {
    if (typeof totalSeconds !== 'number' || totalSeconds < 0 || !Number.isInteger(totalSeconds)) {
        throw new Error("Invalid input. totalSeconds must be a non-negative integer.");
    }

    const hours = Math.floor(totalSeconds / 3600);
    const remainingSecondsAfterHours = totalSeconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = remainingSecondsAfterHours % 60;

    // Pad with leading zeros if necessary
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}


class DayComponent extends Component {
    constructor(parent, data) {
        super(parent, {});
        new TextComponent(parent, { el: "h2" }, { text: data.date });
        // data.events.forEach(e => {
        //     new TextComponent(parent, { class: "person" }, { text: e.description });
        // })
    }

}

class AnimatedMoments extends Component {
    constructor(parent, event, deviceMoments) {
        super(parent);
        let c = 0;
        let last = null;
        let intId = setInterval(e => {
            if (last != null) {
                last.remove();
            }
            if (c == deviceMoments.length) {
                clearInterval(intId);
                return;
            }

            let m = deviceMoments[c];
            last = new AMoment(this, m);
            c++;
        }, 3000);

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
// class AMoment extends Component {
//     constructor(parent, data) {
//         super(parent, {});
//         let t = getObservationString(data);
//         new TextComponent(this, { el: "h2" }, { text: t });
//         if (data.sender) {
//             new TextComponent(this, { class: 'big-text' }, { text: data.sender });
//         }
//         new TextComponent(this, { class: 'big-text' }, { text: data.data });
//     }
// }


// export class MomentsContainer extends Component {
//     constructor(parent, data) {
//         super(parent);
//         // let label = new TextComponent(this, {el: "h3"}, {text: event.time+" "+event.description});
//         this.table = new Component(this, { el: "table" });
//         if (data)
//             this.add(data);

//     }
//     add(deviceMoments) {
//         deviceMoments.forEach(moment => {
//             let m = new MomentComponent(this.table, moment);
//             m.visible(false);
//         });
//     }
//     show(start, count) {
//         let end = start + count;
//         this.table.children.forEach((m, idx) => {
//             m.visible(idx >= start && idx <= end);
//         })
//     }
// }
// class MomentComponent extends Component {
//     constructor(parent, data) {
//         // super(parent, {class: "row-container small-text"});
//         super(parent, { el: "tr", class: "top-aligned-cell" });
//         this.time = $$({ parent: this.el, el: "td", class: "small-text" });
//         // this.deviceIcon = $$({ parent: this.el, el: "td", class: "small-text w100" });
//         // this.typeIcon = $$({ parent: this.el, el: "td", class: "small-text w100" });
//         // this.appIcon = $$({ parent: this.el, el: "td", class: "small-text w100" });
//         this.textInfo = $$({ parent: this.el, el: "td", class: "small-text" });
//         this.data = data;
//     }

//     draw() {
//         if (this._data) {
//             this.time.innerText = this._data.time
//             // this.deviceIcon.innerText = this._data.device
//             // this.typeIcon.innerText = this._data.type;
//             // this.appIcon.innerText = (this._data.senderApp ? this._data.senderApp : "");
//            if (this._data.type)
//                 this.textInfo.classList.add(this._data.type.replaceAll(" ", "-"));
//             this.textInfo.innerText =
//                 (this._data.senderApp ? this._data.senderApp + " / " : "") +
//                 (this._data.sender ? this.data.sender + " : " : "") +
//                 this._data.data;
//         }
//     }
// }

// class TrackingContainer extends Component {
//     constructor(parent, organized) {
//         super(parent);
//         // let label = new TextComponent(this, {el: "h3"}, {text: event.time+" "+event.description});
//         this.table = new Component(this, { el: "table" });
//     }
//     add(organized) {
//         organized.forEach(m => {
//             if (m.shouldTrack)
//                 new TrackingRow(this.table, m);
//         });
//     }
// }

// class TrackingRow extends Component {
//     constructor(parent, data) {
//         // super(parent, {class: "row-container small-text"});
//         super(parent, { el: "tr", class: "top-aligned-cell" });
//         this.time = $$({ parent: this.el, el: "td", class: "small-text" });
//         this.textInfo = $$({ parent: this.el, el: "td", class: "small-text" });
//         this.trackingInfo = $$({ parent: this.el, el: "td", class: "small-text" });
//         this.data = data;

//     }

//     draw() {
//         if (this._data) {
//             this.time.innerText = this._data.observation.time;
//             this.textInfo.innerText = (this._data.observation.sender ? this.data.observation.sender + ": " : "") + this._data.observation.data;
//             this.trackingInfo.innerText = this._data.spaceName + " " + this._data.trackingNextStep + " " + this._data.trackingReason;
//         }
//     }
// }

export class Button extends Component {
    constructor(parent, options={}, data=null) {
        super(parent, { el: "button", ...options });
        if (data) {
            this.data = data
        } else {
            this.data = { text: "" };
        }
        this.el.addEventListener("click", this._fireChange.bind(this));
    }

    draw() {
        if (this._data) {
            this.el.innerText = this._data.text;
        }
    }
    _fireChange(e) {
        this.emit("click");
    }
}

class GeneratedImage extends Component {
    constructor(parent, prompt) {
        super(parent);
        let img = $$({ parent: this.el, el: 'img' });
        img.width = "450";
        dofetchGeminiImage(prompt, e => {
            img.src = e;
        });
    }
}

export class ImageComponent extends Component {
    constructor(parent, options, url={}) {
        super(parent, { el: "img", ...options });
        this.el.width = options.width ? options.width : "200";
        this.data = url;
    }
    draw(){
        if (this.data.src)
            this.el.src = this.data.src;
    }
}

export class RangeInput extends Component {
    constructor(parent, options, data) {
        super(parent, { el: "input", ...options });
        this.el.type = "range";
        this.el.addEventListener('input', e => {
            this._data = Number(this.el.value);
            this.emit('change', this._data);
        });
        this.data = data ? data : 0;
    }
    set max(maxValue){
        this.el.max = maxValue;
    }
    set min(minValue){
        this.el.min = minValue;
    }
    draw() {
        this.el.value = this._data;
    }
}

class Input extends Component {
    constructor(parent) {
        super(parent, { el: "input" });
        this.el.addEventListener("change", this._fireChange.bind(this));
        this.el.addEventListener("keyup", this._fireKeyup.bind(this));
    }
    draw() {
        if (this._data) {
            this.el.value = this._data;
        }
    }
    _fireChange(e) {
        this._data = this.el.value;
        this.emit("value", this._data);
        this.emit("submit", this._data);
    }
    _fireKeyup(e) {
        this._data = this.el.value;
        this.emit("keyup", this._data);
    }
}

class Select extends Component {
    constructor(parent, options) {
        super(parent, { el: "select" });
        this.options = options;
        for (let i=0; i<options.length; i++) {
            // let o = $$({el: "option", text: options[i]});
            // this.el.addChild(o);
            let o = options[i];
            let newOption = null;
            if (o.name && o.value)
                newOption = new Option(o.name, o.value);
            else
                newOption = new Option(o);
            this.el.add(newOption);
        }
        this.el.selectedIndex = -1;
        this.el.addEventListener("change", this._fireChange.bind(this));
    }
    draw() {
        if (this._data) {
            this.el.selectedIndex = this._data;
        }
    }
    _fireChange(e){
        this._data = this.options[this.el.selectedIndex];
        if (this._data.value)
            this._data = this._data.value;
        this.emit("value", this._data);
    }
}

class Suggestion extends Component {
    constructor(parent, options) {
        super(parent, { el: "div", class: "suggestions" });
        this.options = options;
        for (let i = 0; i < options.length; i++) {
            let o = $$({ parent: this.el, text: options[i], class: "suggestion" });
            o.addEventListener("click", this._fireChange.bind(this))
        }
    }
    draw() {
        // if (this._data) {
        //     this.el.selectedIndex = this._data;
        // }
    }
    _fireChange(e) {
        for (let i = 0; i < this.el.children.length; i++) {
            let eli = this.el.children[i];
            if (eli != e.srcElement) {
                eli.remove();
                i -= 1;
            }
        }
        this._data = e.srcElement.innerText;
        this.emit("value", this._data);
        this.emit("submit", this._data);
    }
}

class TextArea extends Component {
    constructor(parent) {
        super(parent, { class: "input" });
        this.input = $$({ parent: this.el, el: "textarea" });
        this.input.addEventListener("change", this._fireChange.bind(this));
    }
    draw() {
        if (this._data) {
            this.input.value = this._data;
        }
    }
    _fireChange(e) {
        this._data = this.input.value;
        this.emit("value", this._data);
    }
}

class InfoCard extends Component {
    constructor(parent, options = { class: "card1 blue" }) {
        super(parent, options);
    }
}



class Answers extends Component {
    constructor(parent, data, classes) {
        super(parent, { class: classes ? classes[0] : "answers" });
        this.classes = classes;
        this.selectedIdx = -1;
        this.data = data ? data : [];
    }
    draw() {
        this.clear();
        let parent = this;
        let itemClass = this.classes != null ? this.classes[1] : "answer";
        this._data.forEach(function (answer, idx) {
            let a = new Answer(parent, itemClass);
            if (parent.selectedIdx == idx) {
                a.selected = true;
            }
            a.click(function () {
                parent.select(idx);
            });
            a.data = { text: answer };
        })
    }
    select(idx) {
        if (idx == this.selectedIdx) {
            idx = -1;
        }
        this.selectedIdx = idx;
        this.draw();
        this.emit("value", this.answer);
    }
    get answer() {
        if (this.selectedIdx == -1)
            return null;
        else
            return this._data[this.selectedIdx];
    }
    set answer(a) {
        this.select(this._data.indexOf(a));
    }

}

class Answer extends TextComponent {
    constructor(parent, className) {
        super(parent, { class: className });
    }
    draw() {
        super.draw();
        if (this.selected) {
            this.el.classList.add("selected");
        } else {
            this.el.classList.remove("selected");
        }
    }
}





