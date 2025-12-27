var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// AbstractAPI Configuration
const API_KEY = "5161dd148ef34d4aaec17e1ad8d6c5b3"; 
let isEmailValid = false; 
let debounceTimer;

// Create status message element next to the button
var statusText = document.createElement('span');
statusText.style.cssText = "margin-left:15px; font-size:0.9rem; display:inline-block; vertical-align:middle; font-family:'League Spartan', sans-serif;";
document.querySelector('.btns').appendChild(statusText);

// 1. High-Precision Verification Function
async function verifyEmailReal(emailVal) {
    if (!emailVal.includes('@')) return false;
    
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${emailVal}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Console log so you can see the 'quality_score' while testing
        console.log("Email Data:", data);

        // Check 1: Is it explicitly undeliverable?
        if (data.deliverability === "UNDELIVERABLE") return false;

        // Check 2: Is it a temporary/disposable email?
        if (data.is_disposable_email.value === true) return false;

        // Check 3: Is the quality score high enough? (Filters out keyboard smashes)
        if (data.quality_score < 0.5) return false;

        return true; 
    } catch (error) {
        console.error("Verification Error:", error);
        return true; // Fail-safe
    }
}



// 2. Dynamic Pre-Check (Starts 2 seconds after user stops typing)
email.addEventListener('input', () => {
    isEmailValid = false; 
    statusText.innerText = "";
    email.parentElement.style.borderBottom = ''; 
    
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        if (email.value.length > 5) {
            statusText.style.color = "#888";
            statusText.innerText = "verifying email...";
            
            const real = await verifyEmailReal(email.value);
            
            if (!real) {
                statusText.style.color = "#FF0000";
                statusText.innerText = "invalid email";
                email.parentElement.style.borderBottom = '2px #FF0000 solid';
                isEmailValid = false;
            } else {
                statusText.style.color = "#00FF00";
                statusText.innerText = "valid email";
                email.parentElement.style.borderBottom = '2px #00FF00 solid';
                isEmailValid = true;
                
                // Clear the "valid" text after 2 seconds
                setTimeout(() => { if(isEmailValid) statusText.innerText = ""; }, 2000);
            }
        }
    }, 2000); 
});

// 3. Submission Logic
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!yourName.value || !email.value || !sms.value) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "please fill all fields";
        return;
    }

    // Stop if email hasn't been verified or is invalid
    if (!isEmailValid) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "invalid email";
        return;
    }

    // Show "sending message..." for exactly 2 seconds
    btn.disabled = true;
    statusText.style.opacity = '1';
    statusText.style.color = "#888";
    statusText.innerText = "sending message...";

    const data = new FormData(form);

    try {
        // Force the 2-second visual delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // Success: show for exactly 1 second
            statusText.style.color = "#00FF00";
            statusText.innerText = "✓ message sent successfully";
            form.reset();
            email.parentElement.style.borderBottom = '';
            isEmailValid = false;

            setTimeout(() => {
                statusText.style.transition = "opacity 0.5s";
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.innerText = "";
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
