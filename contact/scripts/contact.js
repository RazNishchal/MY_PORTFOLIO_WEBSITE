var yourName = document.getElementById('name');
var email = document.getElementById('email');
var sms = document.getElementById('sms');
var btn = document.getElementById('btn');
var form = document.querySelector('.form'); // Select the form itself

// We use 'submit' on the form instead of 'click' on the button
form.addEventListener('submit', (e) => {
    var theError = false;

    // 1. Check for errors
    [yourName, email, sms].forEach(item => {
        if (!item.value) {
            item.parentElement.style.borderBottom = '2px #FF0000 solid';
            theError = true;
        } else {
            item.parentElement.style.borderBottom = '';
        }
    });

    if (theError) {
        // If there is an error, stop the form from sending
        e.preventDefault();
    } else {
        // If NO error, let the form submit naturally to Formspree!
        // We do NOT clear the values here anymore, 
        // because Formspree needs them to send the email.
        alert('Transmission Initialized. Sending to Nishchal...');
    }
});
