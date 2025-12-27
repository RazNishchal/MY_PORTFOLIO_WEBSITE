var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// Create a status message element to show "Message Sent"
var statusMessage = document.createElement('div');
statusMessage.style.marginTop = '20px';
statusMessage.style.fontFamily = 'League Spartan, sans-serif';
statusMessage.style.fontWeight = 'bold';
statusMessage.style.textAlign = 'center';
form.appendChild(statusMessage);

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page from redirecting

    var theError = false;
    statusMessage.innerText = ""; // Reset status message

    // 1. Validation Logic
    [yourName, email, sms].forEach(item => {
        if (!item.value) {
            item.parentElement.style.borderBottom = '2px #FF0000 solid';
            theError = true;
        } else {
            item.parentElement.style.borderBottom = '';
        }
    });

    if (theError) {
        statusMessage.style.color = "#FF0000";
        statusMessage.innerText = "Please fill all fields.";
        return;
    }

    // 2. Prepare Data
    const data = new FormData(form);
    btn.innerText = "SENDING...";
    btn.disabled = true;

    // 3. Background Transmission (AJAX)
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // SUCCESS
            statusMessage.style.color = "#00FF00"; // Green for success
            statusMessage.innerText = "MESSAGE SENT SUCCESSFULLY!";
            form.reset(); 
            
            // Revert button after 3 seconds
            setTimeout(() => {
                btn.innerText = "Send message";
                btn.disabled = false;
            }, 3000);

        } else {
            // SERVER ERROR
            statusMessage.style.color = "#FF0000";
            statusMessage.innerText = "MESSAGE WAS NOT SENT. TRY AGAIN.";
            btn.disabled = false;
            btn.innerText = "Send message";
        }
    } catch (error) {
        // NETWORK ERROR
        statusMessage.style.color = "#FF0000";
        statusMessage.innerText = "NETWORK ERROR. MESSAGE WAS NOT SENT.";
        btn.disabled = false;
        btn.innerText = "Send message";
    }
});
