var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

// 1. Create a span for the message next to the button
var statusText = document.createElement('span');
statusText.style.marginLeft = '15px';
statusText.style.fontFamily = 'inherit';
statusText.style.fontSize = '0.9rem';
statusText.style.transition = 'opacity 0.4s';
statusText.style.verticalAlign = 'middle';

// 2. Add the span into the button container
var btnContainer = document.querySelector('.btns');
btnContainer.appendChild(statusText);

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    var theError = false;
    statusText.innerText = ""; 
    statusText.style.opacity = '1';

    // Validation
    [yourName, email, sms].forEach(item => {
        if (!item.value) {
            item.parentElement.style.borderBottom = '2px #FF0000 solid';
            theError = true;
        } else {
            item.parentElement.style.borderBottom = '';
        }
    });

    if (theError) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Please fill all fields";
        return;
    }

    // Prepare Data
    const data = new FormData(form);
    
    // Show "Sending message..." next to button
    btn.disabled = true;
    statusText.style.color = "#000000"; 
    statusText.innerText = "Sending message...";

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // Success
            statusText.style.color = "#000000"; 
            statusText.innerText = "Message sent successfully";
            setTimeout(() => {
  statusText.innerText = "";
}, 1200);
            form.reset(); 
            
            // Wait 2 seconds, then fade out and reset button
            setTimeout(() => {
                statusText.style.opacity = '0';
                btn.disabled = false;
            }, 2000);

        } else {
            // Error
            statusText.style.color = "#FF0000";
            statusText.innerText = "Message was not sent";
            btn.disabled = false;
        }
    } catch (error) {
        statusText.style.color = "#FF0000";
        statusText.innerText = "Connection error";
        btn.disabled = false;
    }
});
