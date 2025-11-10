function main() {
        callDefaultLLM(personaPrompt(p[0], p[1], p[2], p[3]), user => {
            console.log(user);
            new PersonComponent(rootComponent, user);
            props.user = user;
            date = new Date();
            callDefaultLLM(processTemplate(S2_DAY,
                { user: JSON.stringify(user), date: date.toString() }),
                userDay => {
                    console.log(userDay);
                    new DayComponent(rootComponent, userDay);
                    moments = new MomentsContainer(rootComponent);

                    props.day = userDay;
                    getNextEvent();
                });
        });
    }
    main();


    function getNextEvent() {
        if (props.eventIdx >= props.day.events.length)
            return;
        let event = props.day.events[props.eventIdx];
        let m =
            callDefaultLLM(processTemplate(S3_AMBIENT_OBSERVATIONS, {
                user: JSON.stringify(props.user),
                day: JSON.stringify(props.day),
                event: JSON.stringify(event),
                date: date.toString()
            }), deviceMoments => {
                // console.log(event, deviceMoments);
                // new AnimatedMoments(rootComponent, event, deviceMoments);
                moments.add(deviceMoments);
                callDefaultLLM(processTemplate(S4_ORGANIZE_AND_TRACK, {
                    user: JSON.stringify(props.user),
                    spaces: props.spaces.toString(),
                    observations: JSON.stringify(deviceMoments),
                    date: date.toString()
                }), organized => {
                    console.log(organized);
                    // new TrackingContainer(rootComponent, organized);
                    organized.forEach(o => {
                        if (o.shouldTrack) {
                            props.spaces.add(o);
                        }
                    })
                    drawSpaces();
                    props.observations = [...props.observations];
                    props.eventIdx++;
                    getNextEvent();
                });
            });
    }