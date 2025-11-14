

const S42_ORGANIZE_AND_TRACK = `
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
Refer to the user as "you".
Reasons should be under 20 words.

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
`
