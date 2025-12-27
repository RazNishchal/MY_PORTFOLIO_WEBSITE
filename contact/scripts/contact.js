var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// Your Google Client ID
const CLIENT_ID = "934084881410-798rveo0nejv0hm3kp66idimjrji7e0m.apps.googleusercontent.com";

// Status message element
var statusText = document.createElement('span');
statusText.style.cssText = "margin-left:15px; font-size:0.9rem; display:inline-block; vertical-align:middle; font-family:'League Spartan', sans-serif;";
document.querySelector('.btns').appendChild(statusText);

// 1. Initialize Google Sign-In
window.onload = function () {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("google_btn"),
        { 
            theme: "filled_black", 
            size: "large", 
            shape: "pill",
            text: "signin_with",
            width: "250" 
        }
    );
};

// 2. Handle Google Response
function handleCredentialResponse(response) {
    // Decode the Google Token
    const responsePayload = parseJwt(response.credential);

    // Auto-fill and Lock (Read-Only)
    yourName.value = responsePayload.name;
    email.value = responsePayload.email;
    yourName.readOnly = true;
    email.readOnly = true;

    // Visual feedback for verification
    yourName.style.borderBottom = "2px #00FF00 solid";
    email.style.borderBottom = "2px #00FF00 solid";
    
    // Hide Google button and show verified status
    document.getElementById("google_btn").style.display = "none";
    statusText.style.color = "#00FF00";
    statusText.innerText = "Verified by Google ✓";
}

// Helper to decode user info
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

// 3. Form Submission Logic
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ensure they logged in with Google first
    if (!email.readOnly) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "please login with google first";
        return;
    }

    // Ensure message is not empty
    if (!sms.value.trim()) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "please write a message";
        return;
    }

    // "sending message..." for exactly 2 seconds
    btn.disabled = true;
    statusText.style.opacity = '1';
    statusText.style.color = "#888";
    statusText.innerText = "sending message...";

    const data = new FormData(form);

    try {
        // Force the 2-second visual delay you requested
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // Success: show for 1 second
            statusText.style.color = "#00FF00";
            statusText.innerText = "✓ message sent successfully";
            form.reset();
            
            // Clean up UI
            yourName.readOnly = false;
            email.readOnly = false;
            yourName.style.borderBottom = "";
            email.style.borderBottom = "";

            setTimeout(() => {
                statusText.style.transition = "opacity 0.5s";
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.innerText = "";
                    statusText.style.opacity = '1';
                    statusText.style.transition = "none";
                    btn.disabled = false;
                    document.getElementById("google_btn").style.display = "block";
                }, 500);
            }, 1000); // 1-second success display
        } else {
            statusText.style.color = "#FF0000";
            statusText.innerText = "failed to send";
            btn.disabled = false;
        }
    } catch (error) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "connection error";
        btn.disabled = false;
    }
});
