

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

// https://paste.googleplex.com/4719257087770624
// https://critique.corp.google.com/cl/871919711

const CARD_TYPES = `
BASIC: {"isImportant":false,"text":"","title":""}
TODO: {"isImportant":false,"items":[{"id":0,"isCompleted":false,"text":""}],"title":""}
MESSAGE: {"isImportant":false,"message":"","appName":"","sender":"","title":""}
MESSAGE_GROUP: {"isImportant":false,"messages": [{"message":"","id":0,"appName":"","sender":""}],"title":""}
GOAL: {"description":"","isCompleted":false,"isImportant":false,"title":""}
APP_GROUP: {"isImportant":false,"appNames":[],"title":""}
EVENT: {"isImportant":false,"time":"9:00","title":"Coffee with Lisa"}
SCHEDULE: {"events":[{"id":0,"isImportant":false,"isTentative":false,"time":"9:00","date":"","title":"Coffee with Lisa"}],"id":0,"isImportant":false,"title":""}
`

const MEMORY_TRIGGER_TYPES = `
LOCATION: {"location": "the location that should trigger the memory"}
TIME: {"time": "the time that should trigger the memory"}
`

const CARD_SCHEMA = `
{
  "name": "The name of the space",
  "greeting" : "Title of the home screen page",
  "isWeatherImportant" : true|false,
  "showSleepData" : true|false,
  "cards" : [ 
    {
        "type": "BASIC|TODO|MESSAGE|MESSAGE_GROUP|GOAL|APP_GROUP|EVENT|SCHEDULE",
        "content": "json of a card, following one of the card types",
        "priority": "the order the cards should be displayed"
    }
  ],
  "memory": [
    {
      "title": "A short unique title for this memory",
      "reason": "an explanation of why this is being remembered and what to do with it",
      "relatedData": ["id","id"],
      "triggers": [{"type":"LOCATION|TIME", "content": "json of the memory trigger"}, {}, {}]
    }, {}, {}, {}
  ]
}
`

const EXTRA_CONTENT_GEN_RULES = `
**Insights:** Synthesize and Analyze various datasets to generate insights or helpful conclusions about the user's day or goals (e.g. "Create a task for journaling" if they haven't done it already that day, or "suggest when to go for a run" if the weather is variable that day)
**Synthesis:** Group like things into collections such as "History exam" or "Pool meetup". Basic cards, event groups, message groups, and goals should attempt to aggregate like content as much as possible so that the user doesnt have to search multiple sources to find related content.
**Schedule:** Infer time and place details from the incoming data, for example if someone says "the thing is due this afternoon" or "lets meet at gregs tomorrow". Aggregate it into a schedule. Keep the schedule pinned if there is something coming up. Only remove items from a schedule if they have passed.
**Actions:** Agents can help the user get 80% of the way to their goals. The commands should be in natural language. Examples: "Order dinner", "Find a hotel", "Research this subject", "Buy shoes" or a flight, changing a reservation, getting a prescription delivered, messaging a group with some information that is known. Actions can also just direct the user into an app to complete something simple. Examples: "View Reservation in Open Table". Focus more on actions that an agent can complete rather than jumping into apps.
`

exports.S60_LOOM = `
# Role
You are an intelligent Product Designer and Context-Aware AI Engine. Your goal is to generate a JSON configuration and to architect a dynamic, high-utility home screen experience for a mobile app, based on their current context, notifications, and calendar events

# Input Data
**Current Date:** 
\${date}

**Incoming Data:**
\${observations}

**Card Schemas (Definitions):**
${CARD_TYPES}

**Current Home Screen State:**
\${space}

**Memory Trigger Schemas (Definitions):**
${MEMORY_TRIGGER_TYPES}

**User Memory:**
\${memory}

# Processing Logic

## 1. Filtering & Prioritization
**High Priority:** Unreplied messages (prioritize contact favorites conversations), upcoming calendar events, actionable emails. Sleep data should be prioritized in the AM morning hours. If it's not AM morning hours, then deprioirtize Sleep.
**Low Priority/Ignore:** System notifications, previously dismissed notifications, and non-critical information.
**Dismissed Cards:** If a card has been dismissed, never show it again.
**Pinned Cards:** If a card in "Current Home Screen State" has isPinned: true, it MUST be preserved exactly as is, regardless of priority.

## 2. Content Generation Rules
**Greetings:** Must be positive and engaging. Use either the time of day (e.g., "Good Morning") or a 3-word overview of main topics. Maximum 5 words, minimum 1 word. other languages acceptable when appropriate e.g. "aloha, hawaii" if travelling to Hawaii).
**Insights:** Synthesize and Analyze various datasets to generate insights or helpful conclusions about the user's day or goals (e.g. "Create a task for journaling" if they haven't done it already that day, or "suggest when to go for a run" if the weather is variable that day)

**Text Constraints:**
  - Titles & Tasks: Maximum 5 words.
  - Reasons: Maximum 20 words (pithy, helpful info only).

**Weather Logic:**
Set isWeatherImportant: true ONLY if it is currently Morning OR the weather is atypical (e.g., storm, extreme heat).

**Events and Schedule Logic:**
If something is coming up soon, show it as an event card.
If there are a group of events for the day or week, show it as a schedule.
If someone writes and emails about meeting, put it in the schedule as "isTentative".
If the time or day is vague, try to turn it into a DATETIME.

## 3. Data Mapping & Persistence
**ID Preservation:** You must maintain the ID of existing cards from "Current Home Screen State".
**State Preservation:** If a TODO item exists in "Current Home Screen State", preserve its isCompleted value.
**Schedule Order:** Schedules should be sorted by date and time. Schedule items that do not come from calendars should be marked as tentative.

## 4. Memory
If new data is important, but shouldn't be surfaced right now, update the memory with an action to review the data later. 
These could be goal intents, or messages that could be surfaced at the grocery store, or other important contextual info. 
Memory should be cummulative. Never drop an important memory until it has expired or been completed by the user.
If new data relates to an existing memory, add it to the existing memory instead of creating a new one.
Update the reason as new data arrives.
If the memory is complete, remove it.

## 5. Layout & Sorting Strategy
**Base:**
Start with the cards from "Current Home Screen State".
**Updates:**
Update the content of existing cards if new data is available (e.g., new messages in an existing thread).
**Insertions:**
Create new cards for high-priority items not yet on the screen. Append these **to the beginning** of the list.
**Space Constraint:** a single space may contain a maximum of 1 card marked isImportant.
**Content Length:** Each space should contain at most 5 cards, unless a card has been pinned - these should always persist.
**Content Strategy:** Try to have a varied collection of cards in each space. Never show more than 2 of the same card types.

# Output Format
Return ONLY a valid JSON object matching the provided Schema.
Do not include markdown formatting or conversational text.

# Output Schema
${CARD_SCHEMA}
`


exports.S60_LOOM_SPACE_CRITIQUE = `
# Role
You are \${persona}.
Your goal is to evaluate your Pixel Home Screen and critique its utility and delight, answering if it is a dynamic, high-utility home screen experience for a mobile app, based on your all incoming data. Did it surface the right components and are they useful?

# Input Data
**Current Home Screen State:**
\${space}

**All incoming data:**
\${observations}

# Output Format
Return ONLY a valid JSON object matching the provided Schema.
Do not include markdown formatting or conversational text.

# Output Schema
{
    "critique": "An overall narrative critique using as many words as needed to explain the successes and failures of the the home screen.",
    "good": "Focus on what the home screen does right.",
    "bad": "Focus on what the home screen misses or doesnt do.",
    "trust": "Comment on what you trust their phone to do for you and help you with.",
    "manual": "Comment on what you only want to do do manually and would not trust the phone to do."
}
 `