
    function drawForm(root, r) {
        let c = new Component(root, { class: "card" });
        c.data = {};
        if (r.box)
            drawbox(c, c, r.box);
        return c;
    }

    function drawbox(root, p, boxData) {
        let b = new Component(p, { class: "padded" });
        b.el.style.flexDirection = boxData.flow;
        boxData.children.forEach(cd => {
            let c = drawc(root, b, cd);
            c.addListener("value", e => {
                root.data[cd.name] = e;
            });
        });
        return b;
    }

    function drawc(root, b, d) {
        switch (d.type) {
            case "title":
                return new TextComponent(b, {class: "title"}, d);
            case "display_text":
                return new TextComponent(b, {class: "padded"}, d);
            case "free_text":
            case "number":
                return new Input(b, d.name);
            case "option":
                return new Select(b, d.options);
            case "suggestion":
                return new Suggestion(b, d.options);
            case "confirm-button":
                let ok = new Button(b, d);
                root.okButton = ok;
                ok.addListener("click", e => {
                    console.log(root.data);
                    if (Object.keys(root.data).length != 0) {
                        ok.visible(false);
                        root.emit("submit", root.data);
                    }
                });
                return ok;
            case "location":
                return new LocationInput(b, d.name);
            case "box":
                let db = drawbox(root, b, d);
                return db;
            default:
                throw new Error("No type "+d.type)
        }
    }


