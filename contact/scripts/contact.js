var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form');

form.addEventListener('submit', async (e) => {
    // 1. Prevent the "Go Back" / New Website from opening
    e.preventDefault();

    var theError = false;

    // 2. Validation Logic
    [yourName, email, sms].forEach(item => {
        if (!item.value) {
            item.parentElement.style.borderBottom = '2px #FF0000 solid';
            theError = true;
        } else {
            item.parentElement.style.borderBottom = '';
        }
    });

    if (theError) return;

    // 3. Prepare the data
    const data = new FormData(form);
    
    // Change Button Text to look cool while sending
    btn.innerText = "SENDING...";
    btn.disabled = true;

    // 4. Send the message in the background (AJAX)
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // SUCCESS: Message sent, stay on the same page
            alert('Transmission Successful! I will get back to you soon.');
            form.reset(); // Clears the form for the next message
            btn.innerText = "Send message";
        } else {
            // ERROR from server
            alert('Oops! There was a problem. Please try again.');
        }
    } catch (error) {
        // NETWORK ERROR
        alert('Connection error. Please check your internet.');
    } finally {
        btn.disabled = false;
    }
});
