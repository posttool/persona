function getObservationString(data) {
    if (data == null)
        return "";
    let t = data.time + " / " + data.device + " / " + data.type;
    if (data.senderApp) {
        t += " / " + data.senderApp;
    }
    return t;
}


    /*
    <div class="time1">NOV.14</div>
            <div class="time2">10:15:44</div>
            <div id="space-content-container">
                <div class="space">Top Reads</div>
            </div>*/




class SpacesComponent extends Component {
    constructor(parent, spaces, observationMap = {}) {
        super(parent, { class: 'spaces' });
        this.date = new TextComponent(this, { class: "time1" }, { text: "NOV.14" });
        this.time = new TextComponent(this, { class: "time2" }, { text: "10:15:44" });
        let spacesComponent = new Component(this);
        let spaceComponent = new Component(this);
        let maxTime = "00:00";
        spaces.forEach(space => {
            console.log(space)
            if (space.relatedObservations)
                space.relatedObservations.forEach(obsId => {
                    let task = observationMap[obsId];
                    if (task != null) {
                        maxTime = task.time > maxTime ? task.time : maxTime;
                    }
                });
            console.log(maxTime)
            let s = new SpaceComponent(spacesComponent, space);
            s.title.click(e => {
                spacesComponent.visible(false);
                spaceComponent.clear();
                spaceComponent.visible(true);
                let s1 = new SpaceComponentExtended(spaceComponent, space, observationMap);
                s1.title.click(e => {
                    spacesComponent.visible(true);
                    spaceComponent.visible(false);
                })
            })
        });
        this.time.data = { text: maxTime };

    }
}

class SpaceComponent extends Component {
    constructor(parent, space) {
        super(parent, { class: 'space' });
        this.lastUpdate = -1;

        let row = new Component(this, {class: "row-container"});
        let col1 = new Component(row);
        let col2 = new Component(row);
        
        // this.title = new TextComponent(col1, { class: "big-text" }, { text: space.name });
        this.title = new TextComponent(col1, { class: "medium-text" }, { text: space.subject });
        if (space.tracking.expires)
            new TextComponent(col2, { class: "pill" }, { text: space.tracking.expires });
        else
            new TextComponent(col2, { class: "pill" }, { text: space.relatedObservations.length });


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

class SpaceComponentExtended extends Component {
    constructor(parent, space, observationMap) {
        super(parent, { class: 'space-card' });
        this.title = new TextComponent(this, { class: "big-text" }, { text: space.name });
        new TextComponent(this, { class: "medium-text" }, { text: space.subject });
        let c = new Component(this, { class: 'row-container' });
        new TextComponent(c, {}, { text: space.tracking.reason });
        new TextComponent(c, {}, { text: space.tracking.expires });
        space.relatedObservations.forEach(obsId => {
            let task = observationMap[obsId];
            if (task != null) {
                let taskContainer = new Component(this);
                new TextComponent(taskContainer, { class: 'small-text' }, { text: getObservationString(task) });
                new TextComponent(taskContainer, { class: 'small-text' }, { text: task.data });
            }
        })

        // }
    }
}

class ButtonRow extends Component {
    constructor(parent, actions) {
        super(parent, { class: 'row-container' });
        if (actions) {
            actions.forEach(a => {
                let t = new TextComponent(this, { class: 'small-pill' });
                t.el.innerHTML = a.app + "<br>" + a.intent;
                t.click(e => {
                    console.log(a);
                })
            });
        }
    }

}