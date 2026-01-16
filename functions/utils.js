
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

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.wait = wait;

function parseJSON(r) {
    if (r.indexOf("```json") != -1) {
        json = JSON.parse(r.substring(r.indexOf("```json") + 7, r.length - 4));
    } else {
        json = JSON.parse(r);
    }
    return json;
}
exports.parseJSON = parseJSON;

const { createHash } = require('node:crypto');
function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}
exports.sha256 = sha256


const https = require("https");
async function getUrlBytes(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Request failed with status code ${response.statusCode}`));
                return;
            }
            const chunks = [];
            response.on("data", (chunk) => {
                chunks.push(chunk);
            });
            response.on("end", () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
            response.on("error", (err) => {
                reject(err);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}
exports.getUrlBytes = getUrlBytes;

const fs = require('fs');
async function getFileBytes(filePath) {
    return new Promise((resolve, reject) => {

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                reject(err);
                return;
            }

            // 'data' is a Buffer object containing the file's bytes
            console.log('File content as Buffer:', data);
            resolve(data);
            return;

            // For example, using UTF-8 encoding:
            const fileContentString = data.toString('utf8');
            console.log('File content as string (UTF-8):', fileContentString);

            // To get the size of the file in bytes:
            const fileSizeInBytes = data.length;
            console.log('File size in bytes:', fileSizeInBytes);
        });
    });

}
exports.getFileBytes = getFileBytes;



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
// const llmCache = new NodeCache();

// todo pass llmOfChoice as an arg
async function callLLM(key, prompt, c = 0) {
    if (c < 4) {
        if (c > 0) {
            console.log("RETRY " + c);
        }
        // let r = llmCache.get(prompt);
        // if (r != undefined) 
        //     return r;
        try {
            let r = await llmOfChoice(key, prompt);
            let json = parseJSON(r);
            // llmCache.set(prompt, json);
            return json;
        } catch (e) {
            console.log(e);
            await wait(1500);
            return callLLM(key, prompt, c + 1);
        }
    } else {
        throw new Error("too many retries");
    }
}
exports.callLLM = callLLM;


// image gen


async function ___igquery(key, contents) {
    const AI = new GoogleGenAI({ apiKey: key });
    const response = await AI.models.generateContent({
        model: "gemini-3-pro-image-preview", // "gemini-2.5-flash-image"
        contents: contents,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            console.log(part.text);
        } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, "base64");
            return buffer;
        }
    }
}
exports.generateImage = ___igquery;