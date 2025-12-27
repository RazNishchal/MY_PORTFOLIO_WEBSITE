var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// Global variable to store the photo URL for the second send
let userPhotoURL = "";

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

// 1. Handle Login & Immediate Notification
async function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    yourName.value = payload.name;
    email.value = payload.email;
    userPhotoURL = payload.picture; // Extract the Google profile photo URL

    document.getElementById("google_btn").style.display = "none";
    statusText.style.color = "#888888"; 
    statusText.innerText = "Verified: " + payload.name;

    // FIRST SEND: Notify owner immediately upon login
    await sendToOwner("SYSTEM: User authenticated via Google. Initial identity captured.", userPhotoURL);
}

// Helper function to send data to your form backend
async function sendToOwner(customMessage, photo) {
    const data = new FormData();
    data.append("name", yourName.value);
    data.append("email", email.value);
    data.append("message", customMessage);
    data.append("photo_url", photo); // This makes the photo link visible in your email

    try {
        await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });
        console.log("Owner notified of login.");
    } catch (e) {
        console.error("Auto-send failed", e);
    }
}

// 2. Manual Submit (Second Send)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!email.value) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Please login first";
        return;
    }

    btn.disabled = true;
    statusText.style.color = "#888888";
    statusText.innerText = "sending message...";

    // SECOND SEND: Include the actual user message + identity info + photo
    const data = new FormData(form);
    data.append("photo_url", userPhotoURL); 

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
