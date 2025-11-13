
export class SpacesComponent extends Component {
    constructor(parent, spaces, observationMap) {
        super(parent, { class: 'spaces' });
        this.time = new TextComponent(this, { class: "time" }, { text: "00:00"});
        let spacesComponent = new Component(this);
        let spaceComponent = new Component(this);
        let maxTime = "00:00";
        spaces.forEach(space => {
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
        this.time.data = {text: maxTime};

    }
}

class SpaceComponent extends Component {
    constructor(parent, space) {
        super(parent, { class: 'space-card' });
        this.lastUpdate = -1;
        this.title = new TextComponent(this, { class: "big-text" }, { text: space.name });
        new TextComponent(this, { class: "medium-text" }, { text: space.subject });
        new TextComponent(this, {}, { text: space.tracking.reason });
        if (space.tracking.expires)
            new TextComponent(this, {class:"pill"}, { text: space.tracking.expires });
        if (space.tracking.actions)
            new ButtonRow(this, space.tracking.actions);
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


export class SpacesComponentXXX extends Component {
    constructor(parent, spaces) {
        super(parent, { class: 'spaces-card' });
        this.time = new TextComponent(this, { class: "time" }, { text: "00:00:00" });
        let spacesComponent = new Component(this);
        let spaceComponent = new Component(this);
        let maxDate = 0;
        for (const [spaceName, taskMap] of spaces.map) {
            let s = new SpaceComponent(spacesComponent, spaceName, taskMap);
            maxDate = Math.max(maxDate, s.lastUpdate);
            this.time.data = { text: secondsToTimeString(maxDate) };
            s.addListener('select', e => {
                spacesComponent.visible(false);
                spaceComponent.clear();
                spaceComponent.visible(true);
                let s1 = new CategoryComponent(spaceComponent, e);
                s1.title.click(e => {
                    spacesComponent.visible(true);
                    spaceComponent.visible(false);
                })
            })
        }
    }
}

class SpaceComponentXXX extends Component {
    constructor(parent, spaceName, taskMap) {
        super(parent, { class: 'space-card' });
        this.lastUpdate = -1;
        new TextComponent(this, { class: "big-text" }, { text: spaceName });
        let c = new Component(this, { class: 'row-container' });
        // for (const [categoryName, taskMap] of categoryMap) {
        let maxDate = new Date();
        for (const [taskName, taskList] of taskMap) {
            maxDate = Math.max(maxDate, timeStringToSeconds(taskList[taskList.length - 1].time));
            let deadlines = {};
            taskList.forEach(task => {
                if (task.expires) {
                    deadlines[task.expires] = task.isPriority;
                }
            })
            let c1 = new CategoryPill(c, taskName, deadlines);
            let that = this;
            c1.click(e => {
                that.emit('select', { name: taskName, tasks: taskList })
            })
        }
        this.lastUpdate = Math.max(this.lastUpdate, maxDate);
        // }
    }
}

class CategoryPill extends Component {
    constructor(parent, name, pills) {
        super(parent, { class: 'pill' });
        let c1 = new TextComponent(this, {}, { text: name });
        for (let p in pills) {
            let c2 = new TextComponent(this,
                { class: 'small-pill ' + (pills[p] ? "priority" : "") },
                { text: p });
        }
    }
}


class CategoryComponentXXX extends Component {
    constructor(parent, data) {
        super(parent, { class: 'space-card' });
        this.title = new TextComponent(this, { class: "big-text" }, { text: data.name });
        let timeMap = {};
        // for (const [taskName, taskList] of data.tasks) {
        //     console.log(taskName, taskList);
        //     new TextComponent(this, { class: 'medium-text' }, { text: taskName });
        data.tasks.forEach(task => {
            let taskContainer = new Component(this);
            timeMap[task.time] = taskContainer;
            new TextComponent(taskContainer, { class: 'small-text' }, { text: getObservationString(task) });
            new TextComponent(taskContainer, { class: 'small-text' }, { text: task.data });
            if (task.expires) {
                new TextComponent(taskContainer, { class: 'small-text' }, { text: "**" + task.isPriority });
                new TextComponent(taskContainer, { class: 'small-text' }, { text: "**" + task.expires });
            }
            taskContainer.click(c => {
                console.log(task)
                for (let p in timeMap) {
                    let showRelated = task.relatedObservations.indexOf(p) != -1
                    timeMap[p].el.style.opacity = showRelated ? 1 : .3;
                    timeMap[p].el.style.color = "black";
                }
                taskContainer.children[0].el.color = "rgba(245, 78, 78, 1)";
            })
            new ButtonRow(this, task.actions);
        })

        // }
    }
}

class ButtonRow extends Component {
    constructor(parent, actions) {
        super(parent, { class: 'row-container' });
        if (actions) {
            actions.forEach(a => {
                let t = new TextComponent(this,  { class: 'small-pill' });
                t.el.innerHTML =  a.app + "<br>" + a.intent;
                t.click(e => {
                    console.log(a);
                })
            });
        }
    }

}