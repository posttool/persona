import { $, $$ } from "./util.js";
import { clientData } from "./firebasey.js";

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
    constructor(parent, options, data = { text: "" }) {
        super(parent, options);
        this.data = data;
    }

    draw() {
        if (this._data) {
            this.el.innerText = this._data.text;
        }
    }
}

export class PersonaListUI extends Component {
    constructor(parent, options) {
        super(parent, { class: "persona-list row-container", ...options });
    }
    draw() {
        this.clear();
        let lastId = null;
        this._data.forEach(p => {
            lastId = p.name;
            new PersonTile(this, p)
        });
        new Button(this, {}, { text: "Next page" }).addListener("click", e => {
            this.emit("next", lastId);
        });
    }
}


class PersonTile extends Component {
    constructor(parent, data) {
        super(parent, {});
        new ImageComponent(this, { class: "rounded full-bleed", width: "100" }, { src: data.image });
        new TextComponent(this, { class: "width-150" }, { text: data.name });
        if (clientData != null && clientData.isLoom) {
            this.click(e=>{
                location.href="/loom?id="+data.id;
            });
        } else {
            this.click(e => {
                document.location.href = "/persona.html?id=" + data.id;
            });
        }

    }
}

export class PersonaListUISmall extends Component {
    constructor(parent, options) {
        super(parent, { class: "persona-list-small row-container wrap", ...options });
    }
    draw() {
        this.clear();
        this._data.forEach(p => {
            new PersonTileSmall(this, p).click(e => {
                this.emit('value', p);
            });
        })
    }
}

class PersonTileSmall extends Component {
    constructor(parent, p) {
        super(parent, { class: "pointer" });
        new ImageComponent(this, { class: "rounded", width: "80" }, { src: p.image, alt: p.name });
        // new TextComponent(this, { class: "width-small" }, { text: p.name, width: 50 });
    }
}


export class PersonComponent extends Component {
    constructor(parent, data) {
        super(parent, {});
        new TextComponent(this, { class: "person", el: "h2" }, { text: data.name + ", " + data.age });
        new ImageComponent(this, { class: "rounded", width: "400" }, { src: data.image });
        new TextComponent(this, { class: "person" }, { text: data.occupation });
        new TextComponent(this, { class: "person" }, { text: data.city });
        if (data.state) {
            new TextComponent(this, { class: "person" }, { text: data.state + " " + data.postalCode });
            new TextComponent(this, { class: "person" }, { text: data.country });
        }
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


export class PersonComponentSmall extends Component {
    constructor(parent, data) {
        super(parent, { class: "row-container " });
        this.back = new TextComponent(this, { class: "material-symbols-outlined pointer", el: "h1" }, { text: "arrow_back" });
        new ImageComponent(this, { class: "rounded", width: "120" }, { src: data.image });
        let textC = new Component(this);
        new TextComponent(textC, { class: "person" }, { text: data.name });
        new TextComponent(textC, { class: "person" }, { text: data.city });
        this.daysContainer = new Component(textC);
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

export class Button extends Component {
    constructor(parent, options = {}, data = null) {
        super(parent, { el: "button", ...options });
        if (data) {
            this.data = data
        } else {
            this.data = { text: "" };
        }
        this.el.addEventListener("click", this._fireChange.bind(this));
    }

    enabled(b, el = null) {
        if (el == null)
            el = this.el;
        el.disabled = !b;
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



export class ImageComponent extends Component {
    constructor(parent, options, data = {}) {
        super(parent, { el: "img", ...options });
        this.el.width = options.width ? options.width : "200";
        this.data = data;
    }
    draw() {
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
    set max(maxValue) {
        this.el.max = maxValue;
    }
    set min(minValue) {
        this.el.min = minValue;
    }
    draw() {
        this.el.value = this._data;
    }
}

export class DateInput extends Component {
    constructor(parent, options, data) {
        super(parent, { el: "input", ...options });
        this.el.type = "date";
        this.el.addEventListener('input', e => {
            this._data = new Date(this.el.value);
            this.emit('change', this._data);
        });
        this.data = data ? data : new Date();
    }
    draw() {
        this.el.value = this._data;
    }
}

export class Input extends Component {
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

export class Select extends Component {
    constructor(parent, options) {
        super(parent, { el: "select" });
        this.options = options;
        for (let i = 0; i < options.length; i++) {
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
    _fireChange(e) {
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

export class TextArea extends Component {
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
