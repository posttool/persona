const { shuffle, processTemplate } = require("../utils.js");


/** making a days */

exports.S2_DAY = `
Create a typical day for the following person:
\${user}

On the following date:
\${date}

A typical day should include unexpected diversions, for example
a work or family member needing something or a train being delayed or
a package delivered to the wrong address. Nothing drastic, realistic.

These are prior days. In creating the new day, build upon this history:
\${otherDays}

Create valid JSON output with the following template:
{date: 'YYYY-MM-DD', events: [
  {time: '05:45:13', description: 'wake up ... up to 30 words of description'},
  {time: '07:45:47', description: 'bus to school  ... up to 30 words of description'},
]}
Only produce JSON with no extra writing.
`



exports.S3_AMBIENT_OBSERVATIONS = `
Produce a list of ambient observations, direct commands from the user and messaging and agent/app notifications 
that would be input/output on devices like earbuds, watches, glasses, phones, tablets, laptops, home speaker or tv during the day.

This is the person:
\${user}

This is their day:
\${day}

This is the specific event for which to produce the observations. 
Make sure they relate only to this event and not the whole day.
The person should not use technology here if it is not appropriate:
\${event}

Observation devices: phone, watch, earbud, laptop, speaker
Observation types: wake, touch, motion, location, screen, audio, camera, notification
Each observation type has its own considerations. For example, location data is a named place, while screen data might be an app or website.
When the observation is ambient audio, transcript the audio. 
Only show notifications from senderApps that the user has installed.
People who are sending message often do not know what I am doing or where I am.
The events should make sense as a sequence or sequences performed by the user at this event.
Create valid JSON output based on the following example:
[
{time: "06:37:23", device: 'phone', type: 'location', data: 'home'},
{time: "06:32:13", device: 'watch', type: 'notification', senderApp: 'LocalTube', data: 'train late'},
{time: "06:37:23", device: 'phone', type: 'wake', data: 'biometric unlock'},
{time: "06:37:45", device: 'phone', type: 'touch', data: ''},
{time: "06:38:04", device: 'laptop', type: 'screen', data: 'open Uber app'},
{time: "06:42:09", device: 'laptop', type: 'screen', data: 'open chrome, visit gmail.com, click email from town'},
{time: "06:43:12", device: 'phone', type: 'notification', senderApp: 'Gmail', sender: 'unknown contact', data: '<random email>'},
{time: "06:43:33", device: 'laptop',  type: 'audio', data: '<ambient conversation and/or direct commands to the agent - transcribe here>'},
{time: "06:47:12", device: 'phone', type: 'notification', senderApp: 'WhatsApp', sender: 'Family or friend', data: 'when will you be back?'},
{time: "06:47:19", device: 'phone', type: 'notification', senderApp: 'SnapChat', sender: 'Family or friend', data: 'its on. 2222 hoas way. see you at 8.'},
{time: "06:53:09", device: 'phone', type: 'notification', senderApp: 'Gmail', sender: 'Family or friend or work or mailinglist', data: 'Folk yeah festival highlight'},
{time: "06:54:37", device: 'phone', type: 'notification', senderApp: 'Gmail', sender: 'unknown contact', data: '<random email>'},
Only produce JSON with no extra writing.
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






/** making the person */

exports.personaImagePrompt = function (person) {
    return `
A casual photograph or selfie shot on an phone of the following person.

Name: ${person.name}
Age: ${person.age}
Location: ${person.city}
Hobbies: ${person.hobbies}
`;
}

const ages = ['teenager', '20-35', '36-66', '67-98']
const genders = ['female', 'male', 'female', 'male', 'nonbinary']

function getPersonaTemplate() {
    const age = shuffle(ages)[0];
    const gender = shuffle(genders)[0];
    const location = getCountries()[0];
    const extra = getPersonalities()[0];
    return [location, age, gender, extra];
}
exports.getPersonaTemplate = getPersonaTemplate;

function getAllDemographics() {
    const locations = getCountries()
    const extra = getPersonalities();

    let demographics = []
    locations.forEach(location => {
        ages.forEach(age => {
            genders.forEach(gender => {
                extra.forEach(x => {
                    demographics.push([location, age, gender, x]);
                })
            })
        })
    })
    return shuffle(demographics);
}

exports.randomPersonaPrompt = function () {
    let p = getPersonaTemplate();
    return processTemplate(personaPrompt(p[0], p[1], p[2], p[3]));
}

function personaPrompt(location, age, gender, extra) {
    let p = getPersonaTemplate();
    if (location == null || location == "") location = p[0];
    if (age == null || age == "") age = p[1];
    if (gender == null || gender == "") gender = p[2];
    if (extra == null || extra == "") extra = p[3];
    return `
Given location age and gender, create a ${extra} persona.

Input:
  location: ${location}
  age_range: ${age}
  gender: ${gender}

Example output structure:
{
  name: "",
  age: 0,
  city: "",
  country: "",
  occupation: ""
  economic_status: ""
  hobbies: [
    "hobby 1",
    "hobby 2"
  ],
  family: [
    {name: "", relation: ""}, {}, {},
  ],
  friends: [],
  colleagues: [],
  goals_this_week: [
    "goal 1",
    "goal 2"
  ],
  goals_this_year: [
    "goal 1",
    "goal 2"
  ],
  goals_in_life: [
    "goal 1",
    "goal 2"
  ],
  apps_and_services: [
    {app: "Uber", usage: "frequent"},
    {app: "WhatsApp", usage: "frequent"},{},{},{},{},{},{}
  ]
}

Make sure the final output is valid JSON.`;
}
exports.personaPrompt = personaPrompt;

function getCountries() {
    const countries = [
        { "name": "Afghanistan", "code": "AF" },
        { "name": "land Islands", "code": "AX" },
        { "name": "Albania", "code": "AL" },
        { "name": "Algeria", "code": "DZ" },
        { "name": "American Samoa", "code": "AS" },
        { "name": "AndorrA", "code": "AD" },
        { "name": "Angola", "code": "AO" },
        { "name": "Anguilla", "code": "AI" },
        { "name": "Antarctica", "code": "AQ" },
        { "name": "Antigua and Barbuda", "code": "AG" },
        { "name": "Argentina", "code": "AR" },
        { "name": "Armenia", "code": "AM" },
        { "name": "Aruba", "code": "AW" },
        { "name": "Australia", "code": "AU" },
        { "name": "Austria", "code": "AT" },
        { "name": "Azerbaijan", "code": "AZ" },
        { "name": "Bahamas", "code": "BS" },
        { "name": "Bahrain", "code": "BH" },
        { "name": "Bangladesh", "code": "BD" },
        { "name": "Barbados", "code": "BB" },
        { "name": "Belarus", "code": "BY" },
        { "name": "Belgium", "code": "BE" },
        { "name": "Belize", "code": "BZ" },
        { "name": "Benin", "code": "BJ" },
        { "name": "Bermuda", "code": "BM" },
        { "name": "Bhutan", "code": "BT" },
        { "name": "Bolivia", "code": "BO" },
        { "name": "Bosnia and Herzegovina", "code": "BA" },
        { "name": "Botswana", "code": "BW" },
        { "name": "Bouvet Island", "code": "BV" },
        { "name": "Brazil", "code": "BR" },
        { "name": "British Indian Ocean Territory", "code": "IO" },
        { "name": "Brunei Darussalam", "code": "BN" },
        { "name": "Bulgaria", "code": "BG" },
        { "name": "Burkina Faso", "code": "BF" },
        { "name": "Burundi", "code": "BI" },
        { "name": "Cambodia", "code": "KH" },
        { "name": "Cameroon", "code": "CM" },
        { "name": "Canada", "code": "CA" },
        { "name": "Cape Verde", "code": "CV" },
        { "name": "Cayman Islands", "code": "KY" },
        { "name": "Central African Republic", "code": "CF" },
        { "name": "Chad", "code": "TD" },
        { "name": "Chile", "code": "CL" },
        { "name": "China", "code": "CN" },
        { "name": "Christmas Island", "code": "CX" },
        { "name": "Cocos (Keeling) Islands", "code": "CC" },
        { "name": "Colombia", "code": "CO" },
        { "name": "Comoros", "code": "KM" },
        { "name": "Congo", "code": "CG" },
        { "name": "Congo, The Democratic Republic of the", "code": "CD" },
        { "name": "Cook Islands", "code": "CK" },
        { "name": "Costa Rica", "code": "CR" },
        { "name": "Cote D\"Ivoire", "code": "CI" },
        { "name": "Croatia", "code": "HR" },
        { "name": "Cuba", "code": "CU" },
        { "name": "Cyprus", "code": "CY" },
        { "name": "Czech Republic", "code": "CZ" },
        { "name": "Denmark", "code": "DK" },
        { "name": "Djibouti", "code": "DJ" },
        { "name": "Dominica", "code": "DM" },
        { "name": "Dominican Republic", "code": "DO" },
        { "name": "Ecuador", "code": "EC" },
        { "name": "Egypt", "code": "EG" },
        { "name": "El Salvador", "code": "SV" },
        { "name": "Equatorial Guinea", "code": "GQ" },
        { "name": "Eritrea", "code": "ER" },
        { "name": "Estonia", "code": "EE" },
        { "name": "Ethiopia", "code": "ET" },
        { "name": "Falkland Islands (Malvinas)", "code": "FK" },
        { "name": "Faroe Islands", "code": "FO" },
        { "name": "Fiji", "code": "FJ" },
        { "name": "Finland", "code": "FI" },
        { "name": "France", "code": "FR" },
        { "name": "French Guiana", "code": "GF" },
        { "name": "French Polynesia", "code": "PF" },
        { "name": "French Southern Territories", "code": "TF" },
        { "name": "Gabon", "code": "GA" },
        { "name": "Gambia", "code": "GM" },
        { "name": "Georgia", "code": "GE" },
        { "name": "Germany", "code": "DE" },
        { "name": "Ghana", "code": "GH" },
        { "name": "Gibraltar", "code": "GI" },
        { "name": "Greece", "code": "GR" },
        { "name": "Greenland", "code": "GL" },
        { "name": "Grenada", "code": "GD" },
        { "name": "Guadeloupe", "code": "GP" },
        { "name": "Guam", "code": "GU" },
        { "name": "Guatemala", "code": "GT" },
        { "name": "Guernsey", "code": "GG" },
        { "name": "Guinea", "code": "GN" },
        { "name": "Guinea-Bissau", "code": "GW" },
        { "name": "Guyana", "code": "GY" },
        { "name": "Haiti", "code": "HT" },
        { "name": "Heard Island and Mcdonald Islands", "code": "HM" },
        { "name": "Holy See (Vatican City State)", "code": "VA" },
        { "name": "Honduras", "code": "HN" },
        { "name": "Hong Kong", "code": "HK" },
        { "name": "Hungary", "code": "HU" },
        { "name": "Iceland", "code": "IS" },
        { "name": "India", "code": "IN" },
        { "name": "Indonesia", "code": "ID" },
        { "name": "Iran, Islamic Republic Of", "code": "IR" },
        { "name": "Iraq", "code": "IQ" },
        { "name": "Ireland", "code": "IE" },
        { "name": "Isle of Man", "code": "IM" },
        { "name": "Israel", "code": "IL" },
        { "name": "Italy", "code": "IT" },
        { "name": "Jamaica", "code": "JM" },
        { "name": "Japan", "code": "JP" },
        { "name": "Jersey", "code": "JE" },
        { "name": "Jordan", "code": "JO" },
        { "name": "Kazakhstan", "code": "KZ" },
        { "name": "Kenya", "code": "KE" },
        { "name": "Kiribati", "code": "KI" },
        { "name": "Korea, Democratic People\"S Republic of", "code": "KP" },
        { "name": "Korea, Republic of", "code": "KR" },
        { "name": "Kuwait", "code": "KW" },
        { "name": "Kyrgyzstan", "code": "KG" },
        { "name": "Lao People\"S Democratic Republic", "code": "LA" },
        { "name": "Latvia", "code": "LV" },
        { "name": "Lebanon", "code": "LB" },
        { "name": "Lesotho", "code": "LS" },
        { "name": "Liberia", "code": "LR" },
        { "name": "Libyan Arab Jamahiriya", "code": "LY" },
        { "name": "Liechtenstein", "code": "LI" },
        { "name": "Lithuania", "code": "LT" },
        { "name": "Luxembourg", "code": "LU" },
        { "name": "Macao", "code": "MO" },
        { "name": "Macedonia, The Former Yugoslav Republic of", "code": "MK" },
        { "name": "Madagascar", "code": "MG" },
        { "name": "Malawi", "code": "MW" },
        { "name": "Malaysia", "code": "MY" },
        { "name": "Maldives", "code": "MV" },
        { "name": "Mali", "code": "ML" },
        { "name": "Malta", "code": "MT" },
        { "name": "Marshall Islands", "code": "MH" },
        { "name": "Martinique", "code": "MQ" },
        { "name": "Mauritania", "code": "MR" },
        { "name": "Mauritius", "code": "MU" },
        { "name": "Mayotte", "code": "YT" },
        { "name": "Mexico", "code": "MX" },
        { "name": "Micronesia, Federated States of", "code": "FM" },
        { "name": "Moldova, Republic of", "code": "MD" },
        { "name": "Monaco", "code": "MC" },
        { "name": "Mongolia", "code": "MN" },
        { "name": "Montenegro", "code": "ME" },
        { "name": "Montserrat", "code": "MS" },
        { "name": "Morocco", "code": "MA" },
        { "name": "Mozambique", "code": "MZ" },
        { "name": "Myanmar", "code": "MM" },
        { "name": "Namibia", "code": "NA" },
        { "name": "Nauru", "code": "NR" },
        { "name": "Nepal", "code": "NP" },
        { "name": "Netherlands", "code": "NL" },
        { "name": "Netherlands Antilles", "code": "AN" },
        { "name": "New Caledonia", "code": "NC" },
        { "name": "New Zealand", "code": "NZ" },
        { "name": "Nicaragua", "code": "NI" },
        { "name": "Niger", "code": "NE" },
        { "name": "Nigeria", "code": "NG" },
        { "name": "Niue", "code": "NU" },
        { "name": "Norfolk Island", "code": "NF" },
        { "name": "Northern Mariana Islands", "code": "MP" },
        { "name": "Norway", "code": "NO" },
        { "name": "Oman", "code": "OM" },
        { "name": "Pakistan", "code": "PK" },
        { "name": "Palau", "code": "PW" },
        { "name": "Palestinian Territory, Occupied", "code": "PS" },
        { "name": "Panama", "code": "PA" },
        { "name": "Papua New Guinea", "code": "PG" },
        { "name": "Paraguay", "code": "PY" },
        { "name": "Peru", "code": "PE" },
        { "name": "Philippines", "code": "PH" },
        { "name": "Pitcairn", "code": "PN" },
        { "name": "Poland", "code": "PL" },
        { "name": "Portugal", "code": "PT" },
        { "name": "Puerto Rico", "code": "PR" },
        { "name": "Qatar", "code": "QA" },
        { "name": "Reunion", "code": "RE" },
        { "name": "Romania", "code": "RO" },
        { "name": "Russian Federation", "code": "RU" },
        { "name": "RWANDA", "code": "RW" },
        { "name": "Saint Helena", "code": "SH" },
        { "name": "Saint Kitts and Nevis", "code": "KN" },
        { "name": "Saint Lucia", "code": "LC" },
        { "name": "Saint Pierre and Miquelon", "code": "PM" },
        { "name": "Saint Vincent and the Grenadines", "code": "VC" },
        { "name": "Samoa", "code": "WS" },
        { "name": "San Marino", "code": "SM" },
        { "name": "Sao Tome and Principe", "code": "ST" },
        { "name": "Saudi Arabia", "code": "SA" },
        { "name": "Senegal", "code": "SN" },
        { "name": "Serbia", "code": "RS" },
        { "name": "Seychelles", "code": "SC" },
        { "name": "Sierra Leone", "code": "SL" },
        { "name": "Singapore", "code": "SG" },
        { "name": "Slovakia", "code": "SK" },
        { "name": "Slovenia", "code": "SI" },
        { "name": "Solomon Islands", "code": "SB" },
        { "name": "Somalia", "code": "SO" },
        { "name": "South Africa", "code": "ZA" },
        { "name": "South Georgia and the South Sandwich Islands", "code": "GS" },
        { "name": "Spain", "code": "ES" },
        { "name": "Sri Lanka", "code": "LK" },
        { "name": "Sudan", "code": "SD" },
        { "name": "Suriname", "code": "SR" },
        { "name": "Svalbard and Jan Mayen", "code": "SJ" },
        { "name": "Swaziland", "code": "SZ" },
        { "name": "Sweden", "code": "SE" },
        { "name": "Switzerland", "code": "CH" },
        { "name": "Syrian Arab Republic", "code": "SY" },
        { "name": "Taiwan, Province of China", "code": "TW" },
        { "name": "Tajikistan", "code": "TJ" },
        { "name": "Tanzania, United Republic of", "code": "TZ" },
        { "name": "Thailand", "code": "TH" },
        { "name": "Timor-Leste", "code": "TL" },
        { "name": "Togo", "code": "TG" },
        { "name": "Tokelau", "code": "TK" },
        { "name": "Tonga", "code": "TO" },
        { "name": "Trinidad and Tobago", "code": "TT" },
        { "name": "Tunisia", "code": "TN" },
        { "name": "Turkey", "code": "TR" },
        { "name": "Turkmenistan", "code": "TM" },
        { "name": "Turks and Caicos Islands", "code": "TC" },
        { "name": "Tuvalu", "code": "TV" },
        { "name": "Uganda", "code": "UG" },
        { "name": "Ukraine", "code": "UA" },
        { "name": "United Arab Emirates", "code": "AE" },
        { "name": "United Kingdom", "code": "GB" },
        { "name": "United States", "code": "US" },
        { "name": "United States Minor Outlying Islands", "code": "UM" },
        { "name": "Uruguay", "code": "UY" },
        { "name": "Uzbekistan", "code": "UZ" },
        { "name": "Vanuatu", "code": "VU" },
        { "name": "Venezuela", "code": "VE" },
        { "name": "Viet Nam", "code": "VN" },
        { "name": "Virgin Islands, British", "code": "VG" },
        { "name": "Virgin Islands, U.S.", "code": "VI" },
        { "name": "Wallis and Futuna", "code": "WF" },
        { "name": "Western Sahara", "code": "EH" },
        { "name": "Yemen", "code": "YE" },
        { "name": "Zambia", "code": "ZM" },
        { "name": "Zimbabwe", "code": "ZW" }
    ]

    array = []
    countries.forEach(function (e) {
        array.push(e.name);
    })
    return shuffle(array)
}

// https://www.britannica.com/dictionary/eb/3000-words/topic/personality-types
function getPersonalities() {
    let personality_words = [
        "abusive",
        "active",
        "adventurous",
        "affectionate",
        "aggressive",
        "ambitious",
        "annoying",
        "anxious",
        "artistic",
        "bossy",
        "brave",
        "calm",
        "cautious",
        "charming",
        "cheerful",
        "compulsive",
        "confident",
        "conservative",
        "courageous",
        "cowardly",
        "creative",
        "cruel",
        "cynical",
        "decisive",
        "determined",
        "direct",
        "domineering",
        "easygoing",
        "emotional",
        "enthusiastic",
        "extroverted",
        "fearful",
        "frank",
        "friendly",
        "funny",
        "generous",
        "gentle",
        "greedy",
        "gregarious",
        "gullible",
        "happy",
        "honest",
        "imaginative",
        "impatient",
        "impulsive",
        "independent",
        "intelligent",
        "introverted",
        "lazy",
        "loyal",
        "mean",
        "modest",
        "moody",
        "nervous",
        "nice",
        "obsessive",
        "optimistic",
        "outgoing",
        "patient",
        "persistent",
        "pessimistic",
        "pompous",
        "practical",
        "rational",
        "reliable",
        "reserved",
        "ruthless",
        "sarcastic",
        "secretive",
        "self-centered",
        "selfish",
        "sensible",
        "sensitive",
        "serious",
        "shy",
        "sincere",
        "sociable",
        "stubborn",
        "superficial",
        "tactful",
        "tactless",
        "thoughtful",
        "witty",
    ]
    return shuffle(personality_words);
}