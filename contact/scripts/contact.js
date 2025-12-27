var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

let autoSendTimer; 
let isManualSent = false;
const FIVE_MINUTES = 5 * 60 * 1000; 

const CLIENT_ID = "934084881410-798rveo0nejv0hm3kp66idimjrji7e0m.apps.googleusercontent.com";

var statusText = document.createElement('span');
statusText.style.cssText = "margin-left:15px; font-size:0.9rem; display:inline-block; vertical-align:middle; font-family:'League Spartan', sans-serif;";
document.querySelector('.btns').appendChild(statusText);

// Initialize inputs as grey and read-only immediately
yourName.readOnly = true;
email.readOnly = true;
yourName.style.borderBottom = "2px #888888 solid";
email.style.borderBottom = "2px #888888 solid";
yourName.style.color = "#888888";
email.style.color = "#888888";

window.onload = function () {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("google_btn"),
        { theme: "filled_black", size: "large", shape: "pill" }
    );
};

// 1. Handle Login & Start Timer
function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    yourName.value = payload.name;
    email.value = payload.email;

    // Keep borders and text grey after fill
    yourName.style.borderBottom = "2px #888888 solid";
    email.style.borderBottom = "2px #888888 solid";
    yourName.style.color = "#888888";
    email.style.color = "#888888";
    
    document.getElementById("google_btn").style.display = "none";
    statusText.style.color = "#888888"; 
    statusText.innerText = "Verified: " + payload.name;

    // Start 5-minute timer for lead capture
    autoSendTimer = setTimeout(() => {
        if (!isManualSent) {
            autoSendLeadInfo("System: User logged in but did not submit a message within 5 minutes.");
        }
    }, FIVE_MINUTES);
}

// 2. Background Auto-Send
async function autoSendLeadInfo(customMessage) {
    const data = new FormData();
    data.append("name", yourName.value);
    data.append("email", email.value);
    data.append("message", customMessage);

    try {
        await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });
    } catch (e) {
        console.error("Auto-send failed", e);
    }
}

// 3. Manual Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!email.value) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Please login first";
        return;
    }

    clearTimeout(autoSendTimer);
    isManualSent = true;

    btn.disabled = true;
    statusText.style.color = "#888888";
    statusText.innerText = "sending message...";

    const data = new FormData(form);

    try {
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // ONLY THIS PART TURNS GREEN
            statusText.style.color = "#00FF00"; 
            statusText.innerText = "✓ message sent successfully";
            sms.value = ""; 

            setTimeout(() => {
                statusText.style.transition = "opacity 0.5s";
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.innerText = "";
                    statusText.style.opacity = '1';
                    btn.disabled = false;
                }, 500);
            }, 1000);
        }
    } catch (error) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "error sending";
        btn.disabled = false;
    }
});

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}
