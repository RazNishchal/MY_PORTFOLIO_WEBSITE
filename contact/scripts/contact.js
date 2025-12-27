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

// 1. BLOCKED DOMAINS (Common fake/bot providers)
const blockedDomains = [
    'test.com', 'example.com', 'mailinator.com', 'tempmail.com', 
    '10minutemail.com', 'trashmail.com', 'guerrillamail.com'
];

// 2. REAL-TIME VALIDATION FUNCTION
function checkEmailReality(emailVal) {
    const parts = emailVal.split('@');
    if (parts.length !== 2) return "format_error";
    
    const [user, domain] = [parts[0].toLowerCase(), parts[1].toLowerCase()];

    // Block common fake usernames
    const fakeUsers = ['admin', 'test', 'tester', 'fake', 'asdf', 'none'];
    if (fakeUsers.includes(user) || user.length < 2) return "fake_user";

    // Block disposable domains
    if (blockedDomains.includes(domain)) return "blocked_domain";

    // Standard Format Check
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(emailVal)) return "format_error";

    return "valid";
}

// 3. LISTEN FOR INPUT
email.addEventListener('input', () => {
    const status = checkEmailReality(email.value);
    
    if (email.value === "") {
        emailFeedback.innerText = "";
    } else if (status === "valid") {
        emailFeedback.style.color = "#00FF00";
        emailFeedback.innerText = "valid email address";
    } else {
        emailFeedback.style.color = "#FF0000";
        emailFeedback.innerText = "please provide a real email address";
    }
});



// 4. SUBMISSION LOGIC
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusText.style.opacity = '1';

    const status = checkEmailReality(email.value);

    if (status !== "valid") {
        statusText.style.color = "#FF0000";
        statusText.innerText = "invalid or fake email";
        return;
    }

    // Prepare Transmission
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
            statusText.innerText = "Message failed to send";
            btn.disabled = false;
        }
    } catch (error) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Connection error";
        btn.disabled = false;
    }
});
