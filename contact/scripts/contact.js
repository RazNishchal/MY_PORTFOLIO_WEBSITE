var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

const API_KEY = "5161dd148ef34d4aaec17e1ad8d6c5b3"; 
let isEmailValid = false; 
let debounceTimer;

// Status span next to button
var statusText = document.createElement('span');
statusText.style.cssText = "margin-left:15px; font-size:0.9rem; display:inline-block; vertical-align:middle; font-family:'League Spartan', sans-serif;";
document.querySelector('.btns').appendChild(statusText);

// Function to ping AbstractAPI
async function verifyEmailReal(emailVal) {
    if (!emailVal.includes('@')) return false;
    try {
        const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${emailVal}`);
        const data = await response.json();
        // Returns true if deliverable or unknown, false only if explicitly undeliverable
        return data.deliverability !== "UNDELIVERABLE";
    } catch (error) {
        return true; // Fail safe
    }
}

// 1. DYNAMIC PRE-CHECK: Resets every time the user types
email.addEventListener('input', () => {
    isEmailValid = false; 
    statusText.innerText = "";
    email.parentElement.style.borderBottom = ''; // Reset border while typing
    
    // Cancel the previous timer if user starts typing again
    clearTimeout(debounceTimer);

    // Start a new 2-second countdown
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
                
                // Optional: Clear "valid email" text after 2 seconds to keep it clean
                setTimeout(() => { if(isEmailValid) statusText.innerText = ""; }, 2000);
            }
        }
    }, 2000); 
});



// 2. SUBMISSION LOGIC
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!yourName.value || !email.value || !sms.value) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "please fill all fields";
        return;
    }

    if (!isEmailValid) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "invalid email";
        return;
    }

    // Start sending phase (2 seconds)
    btn.disabled = true;
    statusText.style.opacity = '1';
    statusText.style.color = "#888";
    statusText.innerText = "sending message...";

    const data = new FormData(form);

    try {
        // Wait 2 seconds for the "sending" animation/text
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
