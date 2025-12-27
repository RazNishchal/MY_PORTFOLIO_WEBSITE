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

// Initialize UI
yourName.readOnly = true;
email.readOnly = true;
[yourName, email].forEach(el => {
    el.style.borderBottom = "2px #888888 solid";
    el.style.color = "#888888";
});

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

    document.getElementById("google_btn").style.display = "none";
    statusText.style.color = "#888888"; 
    statusText.innerText = "Verified: " + payload.name;

    // IMPORTANT: Start the 5-minute lead capture timer
    autoSendTimer = setTimeout(() => {
        // Only auto-send if the user hasn't clicked "Send Message" yet
        if (!isManualSent) {
            autoSendLeadInfo("SYSTEM NOTIFICATION: User authenticated via Google but abandoned the form before typing a message.");
        }
    }, FIVE_MINUTES);
}

// 2. Background Auto-Send (Lead Capture)
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
        console.log("Lead captured automatically.");
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

    // CRITICAL: Stop the auto-timer so we don't send the "System" message later
    clearTimeout(autoSendTimer);
    isManualSent = true;

    btn.disabled = true;
    statusText.style.color = "#888888";
    statusText.innerText = "sending message...";

    const data = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
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
