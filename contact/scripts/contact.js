var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

var emailFeedback = document.createElement('div');
emailFeedback.style.fontSize = '0.8rem';
emailFeedback.style.marginTop = '5px';
email.parentElement.appendChild(emailFeedback);

var statusText = document.createElement('span');
statusText.style.marginLeft = '15px';
statusText.style.fontSize = '0.9rem';
statusText.style.transition = 'opacity 0.4s ease';
document.querySelector('.btns').appendChild(statusText);

// List of common fake/disposable email domains to block
const bannedDomains = ['test.com', 'example.com', 'mailinator.com', 'tempmail.com', '10minutemail.com'];

function validateRealEmail(emailVal) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(emailVal)) return "invalid";
    
    const domain = emailVal.split('@')[1].toLowerCase();
    if (bannedDomains.includes(domain)) return "fake";
    
    return "valid";
}

// Real-time checking
email.addEventListener('input', () => {
    const result = validateRealEmail(email.value);
    
    if (email.value === "") {
        emailFeedback.innerText = "";
    } else if (result === "valid") {
        emailFeedback.style.color = "#00FF00";
        emailFeedback.innerText = "valid email address";
    } else if (result === "fake") {
        emailFeedback.style.color = "#FF0000";
        emailFeedback.innerText = "disposable/fake email not allowed";
    } else {
        emailFeedback.style.color = "#FF0000";
        emailFeedback.innerText = "enter valid email";
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    statusText.style.opacity = '1';

    const emailStatus = validateRealEmail(email.value);

    if (emailStatus !== "valid") {
        statusText.style.color = "#FF0000";
        statusText.innerText = emailStatus === "fake" ? "use a real email" : "invalid email";
        return;
    }

    // Prepare Data
    const data = new FormData(form);
    btn.disabled = true;
    statusText.style.color = "#888"; 
    statusText.innerText = "Sending message...";

    

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            statusText.style.color = "#ffffff"; 
            statusText.innerText = "Message sent successfully";
            emailFeedback.innerText = "";
            form.reset(); 
            
            setTimeout(() => {
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.innerText = "";
                    btn.disabled = false;
                }, 400);
            }, 2000);

        } else {
            statusText.style.color = "#FF0000";
            statusText.innerText = "Submission failed";
            btn.disabled = false;
        }
    } catch (error) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Connection error";
        btn.disabled = false;
    }
});
