function getObservationString(data) {
    if (data == null)
        return "";
    let t = data.time + " / " + data.device + " / " + data.type;
    if (data.senderApp) {
        t += " / " + data.senderApp;
    }
    return t;
}


class SpacesComponent extends Component {
    constructor(parent, spaces, observationMap = {}) {
        super(parent, { class: 'spaces' });
        this.date = new TextComponent(this, { class: "time1" }, { text: "NOV.15" });
        this.time = new TextComponent(this, { class: "time2" }, { text: "00:00:00" });
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
            if (space.tracking && space.tracking.actions && space.tracking.actions.length != 0) {
                new SpaceComponent(this, space, observationMap);
            }
        });
        this.time.data = { text: maxTime };
        spaces.forEach(space => {
            if (space.tracking && space.tracking.actions.length == 0) {
                let sc = new SpaceComponent(this, space, observationMap);
                sc.el.classList.add("no-action");
            }

        });
    }
}

class SpaceComponent extends Component {
    constructor(parent, space, observationMap) {
        super(parent, { class: 'space ' });
        this.lastUpdate = -1;

        this.mini = new Component(this, { class: "row-container" });
        // let col1 = new Component(row);
        // let col2 = new Component(row, {class: "flexend"});
        // this.title = new TextComponent(col1, { class: "big-text" }, { text: space.name });
        this.title = new TextComponent(this.mini, { class: "medium-text" }, { text: space.subject });
        this.title.el.style.width = "100%"
        if (space.tracking.expires && space.tracking.expires != "N/A")
            new TextComponent(this.mini, { class: "pill flexend" }, { text: space.tracking.expires });
        else
            new TextComponent(this.mini, { class: "pill blue flexend" }, { text: space.relatedObservations.length });

        this.isExtended = false;
        let that = this;

        this.mini.click(doClick);

        function doClick() {
            if (that.extended == null) {
                that.extended = new SpaceComponentExtended(that, space, observationMap);
                that.extended.title.click(doClick)
                that.extended.visible(false);
            }
            if (that.isExtended) {
                that.mini.visible(true);
                that.extended.visible(false);
                that.isExtended = false;
            } else {
                that.mini.visible(false);
                that.extended.visible(true);
                that.isExtended = true;
                that.extended.el.classList.add("new-content");
                setTimeout(() => {
                    that.extended.el.classList.add('show');
                }, 10);
            }
        }
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
        if (space.tracking.expires && space.tracking.expires!="N/A")
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
        super(parent, {} );
        let c = new Component(this, { class: 'app-action-tile' });
        let i = new ImageComponent(c, { width: 32, class: "app-icon" });
        dofetch(SERVICE_URL + "createAppImg1?app=" + action.app, {}, obj => {
            console.log(obj)
            i.data = {src: obj.url};
        });
        if (Object.keys(action.data).length!=0) {
            let t2 = new SimpleActionComponent(c, action);
        }
        let t1 = new Button(this, {class:"small-button"}, { text: action.intent });

        c.click(e => {
            console.log(action);
        })

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
           let t1 = new TextComponent(this, {class: "grey"}, { text: p });
           let t2 = new TextComponent(this, {class: "padded"}, { text: action.data[p] });
        }
    }
}