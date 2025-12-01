exports.GENUX_P1 = `Given the Agent's current state and a specific Yield Type, generate a detailed prompt for an LLM to create a complete, interactive HTML UI. This UI is intended to serve as a **'Yield-to-User' point** within a side panel of a Gemini Chat interface, allowing the AI Agent to seek **Clarification**, request **Confirmation**, or provide a **Progress Update**. The generated UI MUST be optimized for a narrow, vertical side panel layout and visually align with Google Material 3 principles using ONLY inline styles.

The generated prompt for the second LLM should clearly ask for:
A single section labeled "HTML Code:" containing the full, self-contained HTML within a \`\`\`html block.

This HTML MUST adhere to the following:
1.  Be a complete HTML5 document, starting with \`<!DOCTYPE html>\` and including well-formed \`<html>\`, \`<head>\`, and \`<body>\` tags.
2.  Include a \`<title>\` within the \`<head>\` that clearly states the purpose of this yield, combining the user's task context and the Yield Type (e.g., "Confirming Flight Booking," "Clarifying Movie Preferences," "Task Progress: Uber Receipts").
3.  The HTML content in the \`<body>\` must represent a fully viewable initial state of the UI for the current yield point, designed to fit well within a side panel. The UI should clearly present:
    *   **For Yield Type "Clarification":** Present a concise question or statement about what information is missing or ambiguous.
        *   If the agent's question is well-defined and a few likely answers exist, the UI MAY present these as suggested options (e.g., buttons or a selectable list) within a card.
        *   Below any suggested options, or if the question is broad, provide structured input methods (e.g., text fields, dropdowns, radio buttons, checkboxes) to allow the user to provide the necessary details or refine their search. These inputs should be clearly labeled and laid out logically within a card.
        *   The UI must clearly state the overarching question or the information needed.
        *   *Example (Specific - with suggestions):* If the agent needs a meal preference, it might suggest "Vegetarian", "Non-Vegetarian", "Vegan" as buttons, followed by a text input for specific dietary restrictions or allergies.
        *   *Example (Broad - without suggestions):* If the agent needs to know what to search for, it might provide a text input field labeled "Search query" and dropdowns for filters like "Date range" or "Category".
    *   **For Yield Type "Confirmation":** Display a clear summary of the action the agent proposes, outlining all relevant parameters. This should be presented in a reviewable format, likely within a card. Include prominent action buttons such as "Confirm" (styled as a primary action) and "Cancel" or "Edit" (styled as secondary actions).
    *   **For Yield Type "Progress":** Show the current status of the task. Use visual cues like progress indicators, checklists of completed/remaining steps, or clear status messages within a dedicated section or card. While primarily informative, include controls like a "Cancel Task" button if applicable.


4.  **Google Material 3 / Gemini Web App Styling (Inline Only):**
    *   All CSS styling MUST be applied ONLY using \`style\` attributes on individual HTML elements.
    *   Emulate the Gemini web app aesthetics (which is based on Google Material 3) through inline styles. The UI is for a side panel, so keep it clean and not too dense.
    *   **Font Family:** Default to \`font-family: 'Google Sans Text', Roboto, Arial, sans-serif;\`. Use \`'Google Sans', Roboto, Arial, sans-serif;\` for headings.
    *   **Color Palette (Hex Codes):**
        *   Primary Action (Buttons): \`background-color: #0B57D0; color: #FFFFFF;\`
        *   Secondary Action (Buttons): \`color: #0B57D0; border-color: #A3C9FF;\` (often with \`background-color: #FFFFFF;\`)
        *   Surface / Page Background: \`background-color: #FFFFFF;\`
        *   Card Background: \`background-color: #F0F4F9;\` (Slightly blueish grey)
        *   Text on Surface: \`color: #1F1F1F;\`
        *   Secondary Text / Captions: \`color: #444746;\`
        *   Divider: \`border-bottom: 1px solid #C4C7C5;\`
        *   Error: \`color: #B3261E;\`
    *   **Typography (Inline Examples):**
        *   *General Body Text:* \`font-size: 14px; font-weight: 400; line-height: 20px; color: #1F1F1F; font-family: 'Google Sans Text', sans-serif;\`
        *   *Headings (e.g., Card Titles):* \`font-size: 16px; font-weight: 500; line-height: 24px; color: #1F1F1F; font-family: 'Google Sans', sans-serif; margin-bottom: 12px;\`
        *   *List Item Titles:* \`font-size: 14px; font-weight: 500; line-height: 20px; color: #1F1F1F;\`
        *   *Descriptive Text in Lists:* \`font-size: 12px; font-weight: 400; line-height: 16px; color: #444746;\`
    *   **Shapes & Borders:**
        *   Buttons: \`border-radius: 100px;\` (Fully rounded)
        *   Cards: \`border-radius: 12px;\`
        *   Inputs: \`border-radius: 4px; border: 1px solid #747775;\`
    *   **Elevation/Shadows:** Avoid shadows for a flatter, cleaner side panel UI. Use borders if separation is needed. \`box-shadow: none;\`
    *   **Spacing:** Use padding and margins in multiples of 4px or 8px (e.g., \`padding: 16px;\`, \`margin-bottom: 8px;\`).
    *   **Card Layout:** Present content within \`<div>\` elements styled as cards:
        \`style="background-color: #F0F4F9; border-radius: 12px; padding: 16px; margin-bottom: 12px;"\`
    *   **Buttons:**
        *   *Primary:* \`style="background-color: #0B57D0; color: #FFFFFF; border: none; padding: 10px 24px; border-radius: 100px; font-family: 'Google Sans Text', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer;"\`
        *   *Secondary:* \`style="background-color: #FFFFFF; color: #0B57D0; border: 1px solid #A3C9FF; padding: 10px 24px; border-radius: 100px; font-family: 'Google Sans Text', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer;"\`
    *   **List Items:** Use flexbox for layout within list items:
        \`style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"\`

    *   **Crucially:** DO NOT use \`<style>\` tags, external stylesheets, or CSS variables. All styles MUST be inline.

5.  All necessary JavaScript code for interactivity MUST be included within a single \`<script>\` tag. This \`<script>\` tag MUST be placed first in the response.

6.  The JavaScript within the \`<script>\` tag should define functions to handle user interactions. These functions MUST perform the following:
    *   **Gather Inputs:** Collect relevant user inputs from the UI elements.
    *   **Formulate Response String:** Create a natural language string summarizing the user's action and inputs. This string will be used as the text query for the next turn in the conversation.
    *   **Construct Message:** Create a message object.
    *   **Send Message:** Use \`window.parent.postMessage\` to send the message to the hosting application. The \`targetOrigin\` MUST be the placeholder string \`'PLACEHOLDER_PARENT_ORIGIN'\`. The hosting application is responsible for replacing this placeholder with its actual origin before rendering the HTML in the iframe.

    *   **Message Structure:** The object passed to \`postMessage\` MUST have the following structure:
        \`\`\`javascript
        {{
          type: 'nextPrompt',
          payload: {{
            body: "The natural language string describing the user's action and inputs."
          }}
        }}
        \`\`\`

    *   **Example JavaScript Function for Clarification (Movie Selection):**
        \`\`\`javascript
        function handleMovieSelection(movieTitle) {{
          const userActionString = \`User selected the movie: \${{movieTitle}}\`;
          const message = {{
            type: 'nextPrompt',
            payload: {{
              body: userActionString
            }}
          }};
          window.parent.postMessage(message, 'PLACEHOLDER_PARENT_ORIGIN');
        }}
        \`\`\`
    *   **Example JavaScript Function for Confirmation:**
        \`\`\`javascript
        function handleConfirmAction(isConfirmed, details) {{
          let userActionString = "";
          if (isConfirmed) {{
            // Convert details to a concise string format.
            const detailsString = Object.entries(details).map(([key, value]) => \`\${{key}}: \${{value}}\`).join(', ');
            userActionString = \`User confirmed the action. Details: \${{detailsString}}\`;
          }} else {{
            userActionString = "User cancelled the action.";
          }}
          const message = {{
            type: 'nextPrompt',
            payload: {{
              body: userActionString
            }}
          }};
          window.parent.postMessage(message, 'PLACEHOLDER_PARENT_ORIGIN');
        }}
        \`\`\`
    *   **No DOMContentLoaded:** There is NO need to wrap the JavaScript in \`document.addEventListener('DOMContentLoaded', function() {{ ... }});\` or similar wrappers.

7.  **Inline Event Attributes:** Interactive HTML elements (like \`<button>\`, \`<input>\`, \`<a>\`, \`<select>\`) MUST use inline event attributes (e.g., \`onclick\`, \`onchange\`, \`onsubmit\`) to call the JavaScript functions defined in the \`<script>\` tag. These calls should pass necessary data to the JS functions. For example:
    *   \`<button style="..." onclick="handleMovieSelection('Roofman')">Select Roofman</button>\`
    *   \`<button style="..." onclick="handleConfirmAction(true, {{movie: 'Avatar: Fire and Ash', time: '7:30 PM'}})">Confirm Booking</button>\`
    *   \`<button style="..." onclick="handleConfirmAction(false, {{}})">Cancel</button>\`

The generated UI should be structured to clearly guide the user through the agent's current task within a side panel, presenting necessary information and providing controls relevant to the specific yield point.

Yield Type: "{yield_type}" (e.g., "Clarification", "Confirmation", "Progress")
Agent State: "{agent_state}" (e.g., "The agent needs to know which Uber account to access.", "The agent has drafted an email and needs confirmation before sending.", "The agent is currently fetching data from multiple sources.")

Generated LLM Prompt:`;





exports.GENUX_P2 = `Generate a interactive HTML UI. 

A single section labeled "HTML Code:" containing the full, self-contained HTML within a \`\`\`html block.

This HTML MUST adhere to the following:
1.  Be a complete HTML5 document, starting with \`<!DOCTYPE html>\` and including well-formed \`<html>\`, \`<head>\`, and \`<body>\` tags.
2.  Include a \`<title>\` within the \`<head>\` that clearly states the purpose ...
3.  The HTML content in the \`<body>\` must represent a fully viewable initial state of the UI. The UI should clearly present what the situation needs!

4.  **Google Material 3 / Gemini Web App Styling (Inline Only):**
    *   All CSS styling MUST be applied ONLY using \`style\` attributes on individual HTML elements.
    *   Emulate the Gemini web app aesthetics (which is based on Google Material 3) through inline styles. The UI is for a side panel, so keep it clean and not too dense.
    *   **Font Family:** Default to \`font-family: 'Google Sans Text', Roboto, Arial, sans-serif;\`. Use \`'Google Sans', Roboto, Arial, sans-serif;\` for headings.
    *   **Color Palette (Hex Codes):**
        *   Primary Action (Buttons): \`background-color: #0B57D0; color: #FFFFFF;\`
        *   Secondary Action (Buttons): \`color: #0B57D0; border-color: #A3C9FF;\` (often with \`background-color: #FFFFFF;\`)
        *   Surface / Page Background: \`background-color: #FFFFFF;\`
        *   Card Background: \`background-color: #F0F4F9;\` (Slightly blueish grey)
        *   Text on Surface: \`color: #1F1F1F;\`
        *   Secondary Text / Captions: \`color: #444746;\`
        *   Divider: \`border-bottom: 1px solid #C4C7C5;\`
        *   Error: \`color: #B3261E;\`
    *   **Typography (Inline Examples):**
        *   *General Body Text:* \`font-size: 14px; font-weight: 400; line-height: 20px; color: #1F1F1F; font-family: 'Google Sans Text', sans-serif;\`
        *   *Headings (e.g., Card Titles):* \`font-size: 16px; font-weight: 500; line-height: 24px; color: #1F1F1F; font-family: 'Google Sans', sans-serif; margin-bottom: 12px;\`
        *   *List Item Titles:* \`font-size: 14px; font-weight: 500; line-height: 20px; color: #1F1F1F;\`
        *   *Descriptive Text in Lists:* \`font-size: 12px; font-weight: 400; line-height: 16px; color: #444746;\`
    *   **Shapes & Borders:**
        *   Buttons: \`border-radius: 100px;\` (Fully rounded)
        *   Cards: \`border-radius: 12px;\`
        *   Inputs: \`border-radius: 4px; border: 1px solid #747775;\`
    *   **Elevation/Shadows:** Avoid shadows for a flatter, cleaner side panel UI. Use borders if separation is needed. \`box-shadow: none;\`
    *   **Spacing:** Use padding and margins in multiples of 4px or 8px (e.g., \`padding: 16px;\`, \`margin-bottom: 8px;\`).
    *   **Card Layout:** Present content within \`<div>\` elements styled as cards:
        \`style="background-color: #F0F4F9; border-radius: 12px; padding: 16px; margin-bottom: 12px;"\`
    *   **Buttons:**
        *   *Primary:* \`style="background-color: #0B57D0; color: #FFFFFF; border: none; padding: 10px 24px; border-radius: 100px; font-family: 'Google Sans Text', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer;"\`
        *   *Secondary:* \`style="background-color: #FFFFFF; color: #0B57D0; border: 1px solid #A3C9FF; padding: 10px 24px; border-radius: 100px; font-family: 'Google Sans Text', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer;"\`
    *   **List Items:** Use flexbox for layout within list items:
        \`style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"\`

    *   **Crucially:** DO NOT use \`<style>\` tags, external stylesheets, or CSS variables. All styles MUST be inline.

5.  All necessary JavaScript code for interactivity MUST be included within a single \`<script>\` tag. This \`<script>\` tag MUST be placed first in the response.

6.  The JavaScript within the \`<script>\` tag should define functions to handle user interactions. These functions MUST perform the following:
    *   **Gather Inputs:** Collect relevant user inputs from the UI elements.
    *   **Formulate Response String:** Create a natural language string summarizing the user's action and inputs. This string will be used as the text query for the next turn in the conversation.
    *   **Construct Message:** Create a message object.
    *   **Send Message:** Use \`window.parent.postMessage\` to send the message to the hosting application. The \`targetOrigin\` MUST be the placeholder string \`'PLACEHOLDER_PARENT_ORIGIN'\`. The hosting application is responsible for replacing this placeholder with its actual origin before rendering the HTML in the iframe.

    *   **Message Structure:** The object passed to \`postMessage\` MUST have the following structure:
        \`\`\`javascript
        {{
          type: 'nextPrompt',
          payload: {{
            body: "The natural language string describing the user's action and inputs."
          }}
        }}
        \`\`\`

    *   **Example JavaScript Function for Clarification (Movie Selection):**
        \`\`\`javascript
        function handleMovieSelection(movieTitle) {{
          const userActionString = \`User selected the movie: \${{movieTitle}}\`;
          const message = {{
            type: 'nextPrompt',
            payload: {{
              body: userActionString
            }}
          }};
          window.parent.postMessage(message, 'PLACEHOLDER_PARENT_ORIGIN');
        }}
        \`\`\`
    *   **Example JavaScript Function for Confirmation:**
        \`\`\`javascript
        function handleConfirmAction(isConfirmed, details) {{
          let userActionString = "";
          if (isConfirmed) {{
            // Convert details to a concise string format.
            const detailsString = Object.entries(details).map(([key, value]) => \`\${{key}}: \${{value}}\`).join(', ');
            userActionString = \`User confirmed the action. Details: \${{detailsString}}\`;
          }} else {{
            userActionString = "User cancelled the action.";
          }}
          const message = {{
            type: 'nextPrompt',
            payload: {{
              body: userActionString
            }}
          }};
          window.parent.postMessage(message, 'PLACEHOLDER_PARENT_ORIGIN');
        }}
        \`\`\`
    *   **No DOMContentLoaded:** There is NO need to wrap the JavaScript in \`document.addEventListener('DOMContentLoaded', function() {{ ... }});\` or similar wrappers.

7.  **Inline Event Attributes:** Interactive HTML elements (like \`<button>\`, \`<input>\`, \`<a>\`, \`<select>\`) MUST use inline event attributes (e.g., \`onclick\`, \`onchange\`, \`onsubmit\`) to call the JavaScript functions defined in the \`<script>\` tag. These calls should pass necessary data to the JS functions. For example:
    *   \`<button style="..." onclick="handleMovieSelection('Roofman')">Select Roofman</button>\`
    *   \`<button style="..." onclick="handleConfirmAction(true, {{movie: 'Avatar: Fire and Ash', time: '7:30 PM'}})">Confirm Booking</button>\`
    *   \`<button style="..." onclick="handleConfirmAction(false, {{}})">Cancel</button>\`

Generated HTML:`;
