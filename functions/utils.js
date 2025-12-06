
let processTemplate = function(templateString, values) {
    const result = templateString.replace(/\${(\w+)}/g, function (match, key) { return values[key] });
    return result;
}
exports.processTemplate = processTemplate;

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}
exports.shuffle = shuffle;

function random(a) {
    return Math.floor(Math.random() * a);
}
exports.random = random;

function oneOf(array) {
    if (array && array.length != 0)
        return array[random(array.length)];
    else
        return {};
}
exports.oneOf = oneOf;

function getByName(array, name) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name == name) {
            return array[i];
        }
    };
    return null;
}


function parseJSON(r) {
    if (r.indexOf("```json") != -1) {
        json = JSON.parse(r.substring(r.indexOf("```json") + 7, r.length - 4));
    } else {
        json = JSON.parse(r);
    }
    return json;
}
exports.parseJSON = parseJSON;


// Caching
const NodeCache = require( "node-cache" );

// Genai functions
const { GoogleGenAI, Modality, createUserContent, createPartFromUri } = require("@google/genai");

async function getGemini(key, prompt, model="gemini-2.5-flash") {
    const googleGenAI = new GoogleGenAI({ apiKey: key });
    const response = await googleGenAI.models.generateContent({
        model:  model,//gemini-3-pro-preview
        contents: prompt,
    });
    return response.candidates[0].content.parts[0].text;
}
exports.getGemini = getGemini;

const llmOfChoice = getGemini;
const llmCache = new NodeCache();

async function callLLM(key, prompt, c = 0) {
    if (c < 4) {
        if (c > 1) {
            console.log("RETRY " + c);
        }
        let r = llmCache.get(prompt);
        if (r != undefined) 
            return r;
        try {
            let r = await llmOfChoice(key, prompt);
            let json = parseJSON(r);
            llmCache.set(prompt, json);
            return json;
        } catch (e) {
            console.log(e);
            return callLLM(key, prompt, c + 1);
        }
    } else {
        throw new Error("too many retries");
    }
}
exports.callLLM = callLLM;