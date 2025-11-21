

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



const UI_COACHING = `You can use conversation and UI because you are an agent. 
The UI helps the user answer questions in a structured way. 
The UI components are:
    display_text: questions and prompts
    free_text: input for names and descriptions and thoughts, use this only when suggestions or options dont work
    option: input for lists, like named months or days or years or hours
    suggestion: shows a list of suggestions
    number: input for single quanitities
    location: input for choosing a location
    button: can supply an action to submit a form or produce an alert

Create valid json output with the following template:
{
    box: {
        flow: "column",
        children: [
            {
                type: "box", 
                flow: "row",
                children: [
                    {type: "display_text", text: "When where you born?"},
                    {type: "suggestion", options: ["Don't know", "Answer below"]}
                    ]
            },
            {
                type: "box", 
                flow: "row",
                children: [
                    {name: "month", type: "option", options: ["January", "February", ...],
                    {name: "day", type: "option", options: [1, 2, 3, ...],
                    {name: "year", type: "free_text"}
                ]
            },
            {
                type: "box", 
                flow: "row",
                children: [
                    {type: "button", text: "ok", action: "submit"}
                ]
            }
        ]
    }
}
Only produce JSON with no extra writing.
`;
