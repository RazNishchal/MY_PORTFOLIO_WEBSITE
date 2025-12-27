var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// Initialize fields as uneditable immediately
yourName.readOnly = true;
email.readOnly = true;
yourName.style.cursor = "not-allowed";
email.style.cursor = "not-allowed";

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
            text: "signin_with"
        }
    );
};

// 2. Handle Google Response (Fetch Data and Fill)
function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);

    // Inject data from Google
    yourName.value = responsePayload.name;
    email.value = responsePayload.email;

    // Visual confirmation
    yourName.style.borderBottom = "2px #00FF00 solid";
    email.style.borderBottom = "2px #00FF00 solid";
    
    // Hide Login button - data is now locked in
    document.getElementById("google_btn").style.display = "none";
    statusText.style.color = "#00FF00";
    statusText.innerText = "Verified as " + responsePayload.name;
}

// Helper to decode user info
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}



// 3. Submission Logic
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Safety Check: Must be logged in (which fills the name/email)
    if (!email.value) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Please login with Google first";
        return;
    }

    // Safety Check: Message is required
    if (!sms.value.trim()) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Please write a message before sending";
        sms.focus();
        return;
    }

    // Start Sending Phase (2 seconds)
    btn.disabled = true;
    statusText.style.opacity = '1';
    statusText.style.color = "#888";
    statusText.innerText = "sending message...";

    const data = new FormData(form);

    try {
        // 2-second visual delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // Success Phase (1 second)
            statusText.style.color = "#00FF00";
            statusText.innerText = "✓ message sent successfully";
            
            // Reset only the message, keep the user logged in/verified for better UX
            sms.value = ""; 

            setTimeout(() => {
                statusText.style.transition = "opacity 0.5s";
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.innerText = "";
                    statusText.style.opacity = '1';
                    statusText.style.transition = "none";
                    btn.disabled = false;
                }, 500);
            }, 1000); 
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
