

//User:
//\${user}
const S4_ORGANIZE_AND_TRACK = `
On the following date:
\${date}

User Spaces and Tracked Observations:
\${spaces}

New observations:
\${observations}

Your job is to collect all the observations that should be tracked.
Tracking means that there is an action that can be taken by an agent
or a person or the user that can resolve the observation.
If the observation needs attention right away, set "isPriority" to true.
If the observation needs action by a certain time, indicate that as "expires".

If the user addresses the assistant or agent directly, that should
be tracked too, especially if the output will be returned later.
If you observe ambient audio, track it especially if there is information
that could be useful later or something related to another observation.

Tracked observations should be organized into a user space. 
You will need to create new spaces as new themes emerge in the user's life.
Reuse space & subject hierarchy as much as possible for example
if someone continues to call or message, put them under a single subject.

Examples of user spaces:
Academics / History / Write Essay
Academics / History / Prepare for Test
Academics / Math / Prepare for Test
Art / Model Making / Painting
Events / Dinner Plans / Set Time and Place
Family / Mustafa / Greetings

Output as JSON. Example:
[
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "offer help drafting",
        isPriority: false,
        actions: [
            {app: "System", intent: "Log", data: {}}, 
            {app: "Gemini", intent: "Write draft | Create plan | Create mini app", data: {}}, 
            {app: "", intent: "", data: {}}
        ],
        relatedObservations: ["09:01:23"],
    },
    space: {
        name: "Art", 
        subject: "Model Making", 
        subtask: "Painting" 
    }
},
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "needs to pick a location for the birthday party before they are filled up",
        isPriority: false,
        expires: "YYYY-MM-DD HH:MM:SS",
        actions: [{app: "Google Maps", intent: "Search", data: {q: "parks"}},]
        relatedObservations: ["08:13:30", "09:11:02"],
    },
    space: {
        name: "Events", 
        subject: "Birthday Party", 
        subtask: "Pick Location"
    }
},
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "message from Greata that they need AA batteries to finish the project",
        isPriority: false,
        actions: [{app: "Amazon", intent: "Search", data: {q:"AA bateries"}},],
        relatedObservations: [],
    },
    space: {
        name: "TODOs", 
        subject: "Shopping", 
        subtask: "Batteries for Greta's project"
    }
},
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "ambient audio: Graduation party at Donovan's tonight. Ivan needs a ride.",
        isPriority: true,
        actions: [
            {app: "Calendar", intent: "AddEvent", data: {title:"Graduation party", start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS"}},
            {app: "WhatsApp", intent: "SendMessage", data: {recipient:"Ivan", message:"I will be by soon."}},
            {app: "WhatsApp", intent: "SendMessage", data: {recipient:"Ivan", message:"Sorry, I can't pick you up."}},
        ],
        relatedObservations: [],
    },
    space: {
        name: "TODOs", 
        subject: "Shopping", 
        subtask: "Batteries for Greta's project"
    }
},
{
    observation: {}, 
    shouldTrack: false
} 
]
`




exports.S41_ORGANIZE_AND_TRACK = `
On the following date:
\${date}

User Spaces and Tracked Observations:
\${spaces}

New observations:
\${observations}

Your job is to collect all the observations that should be tracked toward a user goal.
A user goal is planning a birthday party or booking a restaurant or buying a sofa or writing a great email.
Some goals take time to accomplish and need reseaerch and comparison.
Tracked observations should be organized into a user space labeled toward the goal's completion. 
You will need to create new spaces as new themes emerge in the user's life.
Reuse space & subject hierarchy as much as possible for example

If the observation needs attention right away, set "isPriority" to true.
If the observation needs action by a certain time, indicate that as "expires".

If you observe ambient audio, track it especially if there is information
that could be useful later or something related to another observation.

Examples of user spaces:
name: Academics, subject: History Essay
name: Academics, subject:  History Test Prep
name: Academics, subject:  Math Test Prep
name: Dinner Plans, subject:  Set Time and Place
name: New Sofa, subject:  Online Browsing
name: New Sofa, subject:  Thoughts from Sofia

Output as JSON. Example:
[
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "user needs help doing task",
        isPriority: false,
        actions: [
            {app: "Gemini", intent: "Write draft | Create plan | Create mini app", data: {}}, 
            {app: "", intent: "", data: {}}
        ],
        relatedObservations: ["09:01:23"],
    },
    space: {
        name: "", 
        subject: ""
    }
},
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "needs to pick a location for the birthday party before they are filled up",
        isPriority: false,
        expires: "Today 3pm|Tomorrow|Saturday",
        actions: [{app: "Google Maps", intent: "Search", data: {q: "parks"}},]
        relatedObservations: ["08:13:30", "09:11:02"],
    },
    space: {
        name: "Birthday Party", 
        subject: "Pick Location"
    }
},
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "message from Greata that they need AA batteries to finish the project",
        isPriority: false,
        actions: [{app: "Amazon", intent: "Search", data: {q:"AA bateries"}},],
        relatedObservations: [],
    },
    space: {
        name: "TODOs", 
        subject: "Shopping"
    }
},
{
    observation: {}, 
    shouldTrack: true, 
    tracking: {
        reason: "ambient audio: Graduation party at Donovan's tonight. Ivan needs a ride.",
        isPriority: true,
        actions: [
            {app: "Calendar", intent: "AddEvent", data: {title:"Graduation party", start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS"}},
            {app: "WhatsApp", intent: "SendMessage", data: {recipient:"Ivan", message:"I will be by soon."}},
            {app: "WhatsApp", intent: "SendMessage", data: {recipient:"Ivan", message:"Sorry, I can't pick you up."}},
        ],
        relatedObservations: [],
    },
    space: {
        name: "Graduation Party", 
        subject: "Logistics"
    }
},
{
    observation: {}, 
    shouldTrack: false
} 
]
`




exports.S42_ORGANIZE_AND_TRACK = `
On the following date:
\${date}

Observations:
\${observations}

Your job is to carefully review all the observations and organize them into spaces.
A space might be goal oriented such as planning a birthday party or booking a restaurant or buying a sofa or writing a great email.

Examples of user spaces:
name: Academics, subject: History essay
name: Academics, subject:  History test prep
name: Academics, subject:  Math test prep
name: Dinner Plans, subject:  Pick a place
name: New Sofa, subject:  Online Browsing
name: New Sofa, subject:  Thoughts from Sofia
name: Party Planning, subject: Birthday gift
name: Party Planning, subject: Dinner party planning

Output the spaces as JSON. Put the most important material first.
Organize the spaces in a way that helps me see whats most important at any given time.

Example:
[{
    name: "Birthday Party", 
    subject: "Pick Location"
    relatedObservations: ["id","id","",""], 
    tracking: {
        reason: "You need to pick a location for the birthday party before they are filled up",
        isPriority: false,
        expires: "Today 3pm|Tomorrow|Saturday",
        actions: [{app: "Google Maps", intent: "Search", data: {q: "parks"}},]
    }
},
{
    name: "TODOs", 
    subject: "Shopping"
    relatedObservations: [], 
    tracking: {
        reason: "Greata wants you to pick up AA batteries",
        isPriority: false,
        actions: [{app: "Amazon", intent: "Search", data: {q:"AA bateries"}},],
        relatedObservations: [],
    }
},
{
    name: "Graduation Party", 
    subject: "Logistics"
    tracking: {
        reason: "ambient audio: Graduation party at Donovan's tonight. Ivan needs a ride.",
        isPriority: true,
        actions: [
            {app: "Calendar", intent: "AddEvent", data: {title:"Graduation party", start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS"}},
            {app: "WhatsApp", intent: "SendMessage", data: {recipient:"Ivan", message:"I will be by soon."}},
            {app: "WhatsApp", intent: "SendMessage", data: {recipient:"Ivan", message:"Sorry, I can't pick you up."}},
        ],
        relatedObservations: [],
    }
},{},{},{},{},{},{}
]
`;




exports.S42_ORGANIZE_AND_TRACK_MIRA = `
User:
\${user}

On the following date:
\${date}

Observations:
\${observations}

Your job is to carefully review all the observations and organize them into spaces.
A space might be goal oriented such as planning a birthday party or booking a restaurant or buying a sofa or writing a great email.

Examples of user spaces:
name: Academics, subject: History essay
name: Academics, subject:  History test prep
name: Academics, subject:  Math test prep
name: Dinner Plans, subject:  Pick a place
name: New Sofa, subject:  Online Browsing
name: New Sofa, subject:  Thoughts from Sofia
name: Party Planning, subject: Birthday gift
name: Party Planning, subject: Dinner party planning

Output the spaces as JSON. Put the most important material first.
Organize the spaces in a way that helps me see whats most important at any given time.
Don't refer to \${user} by name. Use you if its necessary to refer to them.
Reasons should be under 30 words.
Expires should be under 3 words and 20 characters. If there is no expiration date, use N/A.
Actions should include the apps the user uses, as well as system apps, like Notes, Todos, Voice Recorder, Camera, etc.
Actions should include using a Gemini Agent to do almost anything for the user from creating a web site to completing an order process.

Example:
{
  tentativeCalendar: [
    {start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS", title: "", relatedObservations: []},{},{}
  ],
  tentativeTodos: [
    {todo: "Get Milk", relatedObservations: []}, {}, {}
  ],
  entities: [ "King Tide", "AA batteries", "Graduation" ],
  people: [ "", "" ],
  spaces: [{
        name: "Birthday Party", 
        subject: "Pick Location"
        relatedObservations: ["id","id","",""], 
        tracking: {
            reason: "Pick a location for the birthday party before they are filled up",
            isPriority: false,
            expires: "Today 3pm|Tomorrow|Saturday",
            actions: [{app: "Google Maps", intent: "Search", data: {query: "parks"}},]
        }
    },
    {
        name: "TODOs", 
        subject: "Shopping"
        relatedObservations: [], 
        tracking: {
            reason: "Greata wants you to pick up AA batteries",
            isPriority: false,
            actions: [{app: "Amazon", intent: "Search", data: {query:"AA bateries"}},],
            relatedObservations: [],
        }
    },
    {
        name: "Graduation Party", 
        subject: "Logistics"
        tracking: {
            reason: "ambient audio: Graduation party at Donovan's tonight. Ivan needs a ride.",
            isPriority: true,
            actions: [
                {app: "Calendar", intent: "Add Event", data: {title:"Graduation party", start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS"}},
                {app: "WhatsApp", intent: "Send Message", data: {recipient:"Ivan", message:"I will be by soon."}},
                {app: "WhatsApp", intent: "Send Message", data: {recipient:"Ivan", message:"Sorry, I can't pick you up."}},
            ],
            relatedObservations: [],
        }
    },{},{},{},{},{},{}
    ]
}
`




exports.S42_ORGANIZE_AND_TRACK_PDS = `
User:
\${user}

On the following date:
\${date}

Observations:
\${observations}

Your job is to carefully review all the observations and organize them into spaces.
A space might be goal oriented such as planning a birthday party or booking a restaurant or buying a sofa or writing a great email.

Examples of user spaces:
name: Academics, subject: History essay
name: Academics, subject:  History test prep
name: Academics, subject:  Math test prep
name: Dinner Plans, subject:  Pick a place
name: New Sofa, subject:  Online Browsing
name: New Sofa, subject:  Thoughts from Sofia
name: Party Planning, subject: Birthday gift
name: Party Planning, subject: Dinner party planning
name: Health, subject: Sleep log
name: Health, subject: Step goal accomplished
name: To dos, subject: Grocery list
name: Weather, subject: Morning rain

Output the spaces as JSON. Put the most important material first.
Organize the spaces in a way that helps me see whats most important at any given time.
Don't refer to \${user} by name. Use you if its necessary to refer to them.
Tentative todos should only be added if helpful. Don't duplicate information from spaces.
Greetings can reference the time of day or be a three word overview of the main topics. Don't be negative.
Titles and Todos should be short, under 5 words.
Reasons should be under 20 words. Reasons should be pithy, surfacing only the helpful information.
Expires should be under 3 words and 20 characters. If there is no expiration date, use N/A.
Actions should include the apps the user uses, as well as system apps, like Notes, Todos, Voice Recorder, Camera, etc.
Actions should include using a Gemini Agent to do almost anything for the user from creating a web site to completing an order process.

Example:
{
  tentativeCalendar: [
    {start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS", title: "", relatedObservations: []},{},{}
  ],
  tentativeTodos: [
    {todo: "Get Milk", relatedObservations: []}, {}, {}
  ],
  entities: [ "King Tide", "AA batteries", "Graduation" ],
  people: [ "", "" ],
  greeting: "",
  spaces: [{
        name: "Birthday Party", 
        subject: "Pick Location"
        relatedObservations: ["id","id","",""], 
        tracking: {
            reason: "Pick a location for the birthday party before they are filled up",
            isPriority: false,
            expires: "Today 3pm|Tomorrow|Saturday",
            actions: [{app: "Google Maps", intent: "Search", data: {query: "parks"}},]
        }
    },
    {
        name: "TODOs", 
        subject: "Shopping"
        relatedObservations: [], 
        tracking: {
            reason: "Greata wants you to pick up AA batteries",
            isPriority: false,
            actions: [{app: "Amazon", intent: "Search", data: {query:"AA bateries"}},],
            relatedObservations: [],
        }
    },
    {
        name: "Graduation Party", 
        subject: "Logistics"
        tracking: {
            reason: "ambient audio: Graduation party at Donovan's tonight. Ivan needs a ride.",
            isPriority: true,
            actions: [
                {app: "Calendar", intent: "Add Event", data: {title:"Graduation party", start:"YYYY-MM-DD HH:MM:SS", end:"YYYY-MM-DD HH:MM:SS"}},
                {app: "WhatsApp", intent: "Send Message", data: {recipient:"Ivan", message:"I will be by soon."}},
                {app: "WhatsApp", intent: "Send Message", data: {recipient:"Ivan", message:"Sorry, I can't pick you up."}},
            ],
            relatedObservations: [],
        }
    },{},{},{},{},{},{}
    ]
}
`


