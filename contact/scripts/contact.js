var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// API Configuration
const API_KEY = "5161dd148ef34d4aaec17e1ad8d6c5b3"; 

// 1. Inject Animation Styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .status-animation {
        animation: slideIn 0.4s ease forwards;
    }
`;
document.head.appendChild(style);

// 2. Feedback elements
var statusText = document.createElement('span');
statusText.style.marginLeft = '15px';
statusText.style.fontSize = '0.9rem';
statusText.style.display = 'inline-block';
statusText.style.verticalAlign = 'middle';
statusText.style.fontFamily = "'League Spartan', sans-serif";
document.querySelector('.btns').appendChild(statusText);

// Deep Verification Function
async function verifyEmailReal(emailVal) {
    try {
        const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${emailVal}`);
        const data = await response.json();
        return data.deliverability === "DELIVERABLE";
    } catch (error) {
        return true; 
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset status and add animation class
    statusText.classList.remove('status-animation');
    void statusText.offsetWidth; // Trigger reflow to restart animation
    statusText.classList.add('status-animation');
    
    statusText.style.opacity = '1';
    statusText.style.color = "#888";
    statusText.innerText = "Verifying email...";
    btn.disabled = true;

    // Check for empty fields
    if (!yourName.value || !email.value || !sms.value) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Please fill all fields";
        btn.disabled = false;
        return;
    }

    // Deep Verification
    const isReal = await verifyEmailReal(email.value);

    if (!isReal) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "This email does not exist";
        email.parentElement.style.borderBottom = '2px #FF0000 solid';
        btn.disabled = false;
        return;
    }

    // Formspree Submission
    statusText.innerText = "Sending message...";
    const data = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            statusText.style.color = "#00FF00"; // Changed to green for success
            statusText.innerText = "✓ Message sent successfully";
            email.parentElement.style.borderBottom = '';
            form.reset();
            
            // 2-second display rule
            setTimeout(() => {
                statusText.style.transition = "opacity 0.5s";
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.innerText = "";
                    statusText.style.transition = "none";
                    btn.disabled = false;
                }, 500);
            }, 2000);
        } else {
            statusText.style.color = "#FF0000";
            statusText.innerText = "Message failed to send";
            btn.disabled = false;
        }
    } catch (error) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Connection error";
        btn.disabled = false;
    }
});
