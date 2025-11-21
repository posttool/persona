class PersonaListUI extends Component {
    constructor(parent, options) {
        super(parent, { class: "row-container row-container-wrap", ...options });
    }
    draw() {
        this.clear();
        this._data.forEach(p => {
            new PersonTile(this, p).click(e => {
                this.emit('value', p);
            });
        })
    }
}

class PersonTile extends Component {
    constructor(parent, p) {
        super(parent, { class: "pointer" });
        new ImageComponent(this, { class: "rounded", width: "80" }, { src: p.image, alt: p.name });
        // new TextComponent(this, { class: "width-small" }, { text: p.name, width: 50 });
    }
}

class PersonComponent extends Component {
    constructor(parent, data) {
        super(parent, { class: "row-container" });
        this.back = new TextComponent(this, { class: "material-symbols-outlined pointer", el: "h1" }, { text: "arrow_back" });
        new ImageComponent(this, { class: "rounded", width: "120" }, { src: data.image });
        let textC = new Component(this);
        new TextComponent(textC, { class: "person" }, { text: data.name });
        new TextComponent(textC, { class: "person" }, { text: data.city });
        this.daysContainer = new Component(textC);
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

class DayTabs extends Component {
    constructor(parent, options, data) {
        super(parent, { class: "row-container row-container-wrap day-tabs", ...options });
        data.forEach(day => {
            let t = new Button(this, { class: "tab-button" }, { text: day.date });
            t.addListener('click', e => {
                console.log(day);
                this.emit('value', day);
                this.children.forEach(b => {
                    if (b == t)
                        b.el.classList.add("selected");
                    else
                        b.el.classList.remove("selected");
                });
            });
        });
    }
}

class ObservationsView extends Component {
    constructor(parent, data) {
        super(parent, {});
        let slider = new ObservationSlider(this, {}, { min: 0, max: 50, length: data.length });
        let events = new ObservationEvents(this, data);
        let c = new Component(this, { class: "row-container" });
        this.gen = new Button(c, {}, { text: "Space" })
        // this.genImg1 = new Button(c, {}, { text: "Morning" })
        // this.genImg2 = new Button(c, {}, { text: "Afternoon" })
        this.genImg3 = new Button(c, {}, { text: "New bg" })
        // new Button(c, {}, { text: "Other" })
        slider.addListener("value", e => {
            events.show(slider.data.min, slider.data.max - slider.data.min)
        });
        events.show(slider.data.min, slider.data.max - slider.data.min);
        this.slider = slider;
        this.slider.draw();
    }
}

class ObservationSlider extends Component {
    constructor(parent, options, data = { min: 0, max: 5, length: 20 }) {
        super(parent, { class: "obs-slider", ...options });
        this.bg = new Component(this, { class: "bg" })
        this.btwn = new Component(this, { class: "btwn" })
        this.min = new Component(this, { class: "min" })
        this.max = new Component(this, { class: "max" })
        this.min.el.addEventListener("mousedown", this._dragStart.bind(this, "min"))
        this.max.el.addEventListener("mousedown", this._dragStart.bind(this, "max"))
        this.btwn.el.addEventListener("mousedown", this._dragStartB.bind(this))
        document.addEventListener("mouseup", this._dragStop.bind(this))
        this.data = data;
    }
    draw() {
        this.min.el.style.left = ((this.data.min / this.data.length) * this.el.offsetWidth) + "px";
        this.max.el.style.left = ((this.data.max / this.data.length) * this.el.offsetWidth) + "px";
        this.btwn.el.style.left = this.min.el.style.left;
        this.btwn.el.style.width = (((this.data.max - this.data.min) / this.data.length) * this.el.offsetWidth) + "px";
    }
    _dragStart(e, e1) {
        this._dragP = e;
        this._dragF = this._drag.bind(this);
        this._dragX = e1.screenX;
        this._dragO = this._data[this._dragP];
        document.addEventListener("mousemove", this._dragF)
    }
    _drag(e) {
        this._data[this._dragP] = this._dragO + ((e.screenX - this._dragX) / this.el.offsetWidth) * this._data.length;
        this.draw();
        this.emit('value', this._data)
    }
    _dragStop(e, e1) {
        document.removeEventListener("mousemove", this._dragF)
        this.emit('value', this._data)
    }
    _dragStartB(e1) {
        // this._dragP = e;
        this._dragF = this._dragB.bind(this);
        this._dragX = e1.screenX;
        this._dragO = this._data.min;
        this._dragP = this._data.max;
        document.addEventListener("mousemove", this._dragF)
    }
    _dragB(e) {
        this._data.min = this._dragO + ((e.screenX - this._dragX) / this.el.offsetWidth) * this._data.length;
        this._data.max = this._dragP + ((e.screenX - this._dragX) / this.el.offsetWidth) * this._data.length;
        this.draw();
        this.emit('value', this._data)
    }
}


class ObservationEvents extends Component {
    constructor(parent, data) {
        super(parent, { class: "fixed-height" });
        this.table = new Component(this, { el: "table" });
        if (data)
            this.add(data);

    }
    add(deviceMoments) {
        deviceMoments.forEach(moment => {
            let m = new ObservationEvent(this.table, moment);
            m.visible(false);
        });
    }
    show(start, count) {
        let end = start + count;
        this.table.children.forEach((m, idx) => {
            m.visible(idx >= start && idx <= end);
        })
    }
}
class ObservationEvent extends Component {
    constructor(parent, data) {
        // super(parent, {class: "row-container small-text"});
        super(parent, { el: "tr", class: "top-aligned-cell" });
        this.time = $$({ parent: this.el, el: "td", class: "small-text" });
        // this.deviceIcon = $$({ parent: this.el, el: "td", class: "small-text w100" });
        // this.typeIcon = $$({ parent: this.el, el: "td", class: "small-text w100" });
        // this.appIcon = $$({ parent: this.el, el: "td", class: "small-text w100" });
        this.textInfo = $$({ parent: this.el, el: "td", class: "small-text" });
        this.data = data;
    }

    draw() {
        if (this._data) {
            this.time.innerText = this._data.time
            // this.deviceIcon.innerText = this._data.device
            // this.typeIcon.innerText = this._data.type;
            // this.appIcon.innerText = (this._data.senderApp ? this._data.senderApp : "");
            if (this._data.type)    
                this.textInfo.classList.add(this._data.type.replaceAll(" ", "-"));
            this.textInfo.innerText =
                (this._data.senderApp ? this._data.senderApp + " / " : "") +
                (this._data.sender ? this.data.sender + " : " : "") +
                this._data.data;
        }
    }
}



class ImageComponent extends Component {
    constructor(parent, options, data = {}) {
        super(parent, { el: "img", ...options });
        this.el.width = options.width ? options.width : "200";
        this.data = data;
    }
    draw() {
        if (this.data.src)
            this.el.src = this.data.src;
        if (this.data.alt)
            this.el.alt = this.data.alt;
    }
}

class TextComponent extends Component {
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

class Button extends Component {
    constructor(parent, options, data = { text: "" }) {
        super(parent, { el: "button", ...options });
        this.data = data;
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

class GeneratedImage extends ImageComponent {
    constructor(parent, options, prompt) {
        super(parent, options);
        dofetchGeminiImage(prompt, e => {
            this.data = { src: e, alt: prompt };
        });
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