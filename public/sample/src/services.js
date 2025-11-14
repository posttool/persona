function dofetch(apiUrl, params, handler, failure) {
    var networkDiv = document.getElementById('network-status');
    networkDiv.style.display = "block";
    const request = new Request(apiUrl, params);
    fetch(request)
        .then(response => {
            if (!response.ok) {
                console.log("!ok",params,response);
                if (failure)
                    failure(response);
                // networkDiv.style. error
                return;
            }
           return response.json(); // onward to the next then!
        })
        .then(data => {
            networkDiv.style.display = "none";
            handler(data);
        });
}

function callDefaultLLM(prompt, success, failure) {
    callLLM("gemini", prompt, success, failure);
}

function callLLM(which, prompt, success, failure) {
    // console.log("PROMPT", prompt);
    let c = 0;
    let retry = function (f) {
        c++;
        if (c < 4) {
            if (c>1) {
                console.log("RETRY "+c);
            }
            callOne();
        } else {
            failure();
        }
    }
    let callGpt = function () {
        getOpenAICompletion(prompt, r => {
            try {
                let json;
                if (r.indexOf("```json") != -1) {
                    json = JSON.parse(r.substring(r.indexOf("```json") + 7, r.length - 4));
                } else {
                    json = JSON.parse(r);
                }
                success(json);
            } catch (e) {
                console.log(e);
                console.log(r);
                retry();
            }
        }, retry);
    }
    let callGemini = function () {
        dofetchGemini(prompt, r => {
            try {
                let json = JSON.parse(r.substring(r.indexOf("```json") + 7, r.length - 4));
                success(json);
            } catch (e) {
                console.log(e);
                console.log(r);
                retry();
            }
        }, retry);
    }
    function callOne() {
        switch (which) {
            case "gpt":
                callGpt();
                return;
            case "gemini":
                callGemini();
                return;
        }
    }
    retry();
}

/** OPEN AI */
// curl https://api.openai.com/v1/responses \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $OPENAI_API_KEY" \
//   -d '{
//     "model": "gpt-5",
//     "input": "Write a short bedtime story about a unicorn."
//   }'
const OPEN_AI_API_KEY = "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"; // Replace with your actual OpenAI API key
const OPEN_AI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// const OPEN_AI_MODEL = "gpt-4-turbo";
const OPEN_AI_MODEL = "gpt-5-nano"; //

function getOpenAICompletion(promptText, success, failure) {
    dofetch(OPEN_AI_ENDPOINT,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPEN_AI_API_KEY}`,
            },
            body: JSON.stringify({
                model: OPEN_AI_MODEL, 
                messages: [{ role: "user", content: promptText }],
                // max_tokens: 150,
                // temperature: 0.7,
                // format: {"type": "json_object"},
            })
        },
        response => {
            // console.log(response.choices[0].message.content)
            success(response.choices[0].message.content);
        },
        failure);
}

/*
GOOGS
*/

const GKEY = "AIzaSyBNFQYuBsgCk3dfwfGZrOQaiCKgHAiydMM";
const GOOGLE_SEARCH = "https://www.googleapis.com/customsearch/v1?key=AIzaSyBXzoVT6ti7Ul9x0suevmJkDFuafYKsDE4&cx=836c3d378e8094ce4&q=";
const GEO_LOC = `https://maps.googleapis.com/maps/api/geocode/json?key=${GKEY}&address=`;
const TIMEZONE = `https://maps.googleapis.com/maps/api/timezone/json?key=${GKEY}&locations=`
/*
GEMINI
*/

const KKK = "AIzaSyCNEtXyUP3CVxPTfEjWjxsloNzaAq6EYig";
const GEMINI_SERVICE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + KKK;


function dofetchGemini(prompt, handler, failure) {
    dofetch(GEMINI_SERVICE,
        {
            method: "POST",
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        },
        results => {
            let text = results.candidates[0].content.parts[0].text;
            handler(text);
        },
        failure);
}

function dofetchGeminiImage(prompt, handler, failure) {
    const apiKey = KKK;
    const model = 'gemini-2.5-flash-image';
    // const model = 'gemini-2.0-flash-preview-image-generation';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
    dofetch(url, 
        {
            method: 'POST',
            contentType: 'application/json',
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE']
                }
            })
        },
        response => {
            let imageSrc = null;
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    // console.log("Generated text:", part.text);
                } else if (part.inlineData) {
                    // only handles 1, could be fixed up to return many
                    const imageBase64 = part.inlineData.data; 
                    const imageMimeType = part.inlineData.mimeType; // e.g., "image/png"
                    imageSrc = `data:image/${imageMimeType};base64,${imageBase64}`;
                }
            }
            handler(imageSrc);
        },
        failure);
}
