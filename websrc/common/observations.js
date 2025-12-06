import { Component, Button, TextComponent } from "./components.js";
import { $$ } from "./util.js";

export class DayTabs extends Component {
    constructor(parent, options, data) {
        super(parent, { class: "row-container day-tabs", ...options });
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


export class DayTabsSmall extends Component {
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

export class ObservationsView extends Component {
    constructor(parent, data) {
        super(parent, {});
        let slider = new ObservationSlider(this, {}, { min: 0, max: 35, length: data.length });
        let filterTypes = new FilterOptions(this, data)
        let events = new ObservationEvents(this, data);
        function updateEvents(){
            events.show(slider.data.min, slider.data.max - slider.data.min, filterTypes.data);
        }
        filterTypes.addListener("value", updateEvents);
        slider.addListener("value", updateEvents);
        updateEvents();
        this.filterTypes = filterTypes;
        this.slider = slider;
        this.slider.draw();
    }
}

class FilterOptions extends Component {
    constructor(parent, data) {
        super(parent, { class: "row-container small-gap" });
        let map = {}
        data.forEach(obs => {
            map[obs.type] = true;
        });
        this.data = map;
        let types = Object.keys(map).sort();
        types.forEach(t => {
            let c = new CheckboxOption(this, t);
            c.addListener("value", b => {
                this.data[t] = b;
                this.emit("value", this.data);
            });
        });
    }
}

class CheckboxOption extends Component {
    constructor(parent, label, checked = true) {
        super(parent, {});
        this.check = new Component(this, { el: "input", type: "checkbox", class: "" });
        this.text = new TextComponent(this, { el: "span", class: "small-text" }, { text: label });
        this.data = checked;
        //
        this.check.el.addEventListener("change", e => {
            this.emit("value", this.data);
        })
    }
    set data(b) {
        this.check.el.checked = b;
    }
    get data() {
        return this.check.el.checked;
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
    show(start, count, type) {
        let end = start + count;
        this.table.children.forEach((m, idx) => {
            let inRange = idx >= start && idx <= end;
            let inType = type ? type[m.data.type] : true;
            m.visible(inRange && inType);
        })
    }

    hideAudio() {
        this.table.children.forEach((m, idx) => {
            console.log(m.data.type)
            m.visible(m.data.type != "audio");
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