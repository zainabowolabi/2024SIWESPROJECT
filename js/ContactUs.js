document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const alertBox = document.getElementById('alert');

    //show notification
    function showAlert(message, isSuccess) {
        alertBox.className = `mb-6 p-4 rounded-md ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
        alertBox.textContent = message;
        alertBox.classList.remove('hidden');
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Basic form validation
        const requiredFields = ['name', 'email', 'message'];
        let isValid = true;
        //required fields that sets no input to false for 
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500');
            } else {
                input.classList.remove('border-red-500');
            }
        });
            //notification to fill all required fields
        if (!isValid) {
            showAlert('Please fill in all required fields.', false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //accepts correct email format
        if (!emailRegex.test(form.email.value)) {
            showAlert('Please enter a valid email address.', false);
            return;
        }

        // Simulate form submission (makes it possible to submit the form without backend)
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success scenario
            showAlert('Thank you! Your message has been sent successfully.', true);
            form.reset();
        } catch (error) {
            showAlert('Something went wrong. Please try again.', false);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });

    // Reset validation styling on input
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('border-red-500'); //removes error if everything was inputted correctly
            if (alertBox.classList.contains('bg-red-100')) {
                alertBox.classList.add('hidden');
            }
        });
    });
});