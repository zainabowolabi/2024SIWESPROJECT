function initializeHeader() {
    // delay to ensure DOM elements are loaded
    setTimeout(() => {
        initializeUserModal(); //call these functions
        initializeSearch();
        initializeMobileMenu();
        updateAuthUI();
    }, 100);
}
//create authenciation message following action
function showAuthNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50 opacity-0';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    notification.offsetHeight;
    
    // Fade in
    setTimeout(() => {
        notification.classList.remove('opacity-0');
    }, 10);
    setTimeout(() => {
        notification.classList.add('opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300); // Match the duration of the transition
    }, 3000);
}
//login modals
function initializeUserModal() {
    const userIcons = document.querySelectorAll('#userIcon');
    const loginModal = document.querySelector('#loginModal');
    const closeModalBtn = document.querySelector('#closeModalBtn');
    const switchToSignup = document.querySelector('#switchToSignup');
    const switchToLogin = document.querySelector('#switchToLogin');
    const loginForm = document.querySelector('#loginForm');
    const signupForm = document.querySelector('#signupForm');
    const loginLink = document.querySelector('#loginLink');
    const modalTitle = document.querySelector('#modalTitle');

    if (!userIcons.length || !loginModal || !closeModalBtn) {
        return;
    }

    // User icon click handler
    userIcons.forEach(userIcon => {
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (isLoggedIn()) {
                handleLogout();
            } else {
                loginModal.classList.remove('hidden');
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
                loginLink.classList.add('hidden');
                modalTitle.textContent = "Login";
            }
        });
    });

    // Close button handler
    closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('hidden');
    });

    // Outside click handler
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    // Switch to signup form
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            loginLink.classList.remove('hidden');
            modalTitle.textContent = "Sign Up";
        });
    }

    // Switch to login form
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            loginLink.classList.add('hidden');
            modalTitle.textContent = "Login";
        });
    }

    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            handleLogin(email, password);
            // loginModal.classList.add('hidden');
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // loginModal.classList.add('hidden');
            const name = signupForm.querySelector('input[type="text"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;
            
            if (password !== confirmPassword) {
                alert("Passwords don't match!");
                return;
            }
            
            handleSignup(email, password, name);
        });
    }
}

//Search Function
function initializeSearch() {
    // Desktop search
    const searchButton = document.querySelector('#searchButton'); //show search bitton
    const searchInput = document.querySelector('#searchInput'); //show input bar 
    const searchResult = document.querySelector('#searchResult'); //show result from html

    // Mobile search
    const mobileSearchButton = document.querySelector('#mobileSearchButton');
    const mobileSearchInput = document.querySelector('#mobileSearchInput');
    const mobileSearchResult = document.querySelector('#mobileSearchResult');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => performSearch(searchInput, searchResult));
        searchInput.addEventListener('keypress', (e) => {
            //When user press enter key
            if (e.key === 'Enter') {
                performSearch(searchInput, searchResult);
            }
        });
    }

    if (mobileSearchButton && mobileSearchInput) {
        mobileSearchButton.addEventListener('click', () => performSearch(mobileSearchInput, mobileSearchResult));
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(mobileSearchInput, mobileSearchResult);
            }
        });
    }
}
//runs to check if product is found
async function fetchProducts() {
    try {
        const response = await fetch('./products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); //any error here is handled by catch
        }
        const data = await response.json(); //converts to JSON 
        const products = [...data.saleProducts, ...data.newProducts];

        return products;
    } catch (error) {
        console.error("Could not fetch product data:", error);
        return [];
    }
}

//perform search
async function performSearch(inputElement, resultElement) {
    const searchTerm = inputElement.value.trim().toLowerCase();
    
    if (!searchTerm) return;

    const products = await fetchProducts();
    const foundProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) //converts any input to lowrcase
    );

    localStorage.setItem('searchResults', JSON.stringify(foundProducts));
    
    window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`; //put the search term in the result
}


// Function to initialize the mobile menu functionality
function initializeMobileMenu() {
    // Select the hamburger button, mobile menu, and close button elements
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');

    // Check if all necessary elements are found; if not, log an error and stop execution
    if (!hamburgerButton || !mobileMenu || !closeMenu) {
        console.error('Mobile menu elements not found');
        return;
    }

    // Add click event to the hamburger button to open the mobile menu
    hamburgerButton.addEventListener('click', () => {
        // Show the mobile menu by removing the 'hidden' class
        mobileMenu.classList.remove('hidden');
        // Disable page scrolling by setting overflow to 'hidden'
        document.body.style.overflow = 'hidden';
    });

    // Add click event to the close button to close the mobile menu
    closeMenu.addEventListener('click', () => {
        // Hide the mobile menu by adding the 'hidden' class
        mobileMenu.classList.add('hidden');
        // Restore page scrolling by clearing the overflow style
        document.body.style.overflow = '';
    });

    // Select all dropdown buttons within the mobile menu
    const dropdownButtons = document.querySelectorAll('.mobile-dropdown-button');
    dropdownButtons.forEach(button => {
        // Add click event for each dropdown button to toggle visibility of dropdown content
        button.addEventListener('click', function() {
            // Get the next sibling element (the dropdown content) and the arrow icon within the button
            const content = this.nextElementSibling;
            const arrow = this.querySelector('svg');
            
            // Toggle the 'hidden' class to show/hide the dropdown content
            content.classList.toggle('hidden');
            // Toggle the rotation of the arrow icon (for visual feedback)
            arrow.classList.toggle('rotate-180');
        });
    });
}


//Handles Signup and automatically show in the auntheciation message
function handleSignup(email, password, name) {
    const users = JSON.parse(localStorage.getItem('users') || '[]'); //check if there is users in local storage
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        showAuthNotification('Email already registered');
        return;
    }

    // Add new user
    users.push({ email, password, name });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after signup
    handleLogin(email, password);
    showAuthNotification('You have successfully signed in')
    
    // Hide modal
    document.querySelector('#loginModal').classList.add('hidden');
}

//Handles Login and automatically show in the auntheciation message
function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]'); //check if there is users in local storage
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user)); //if user is found
        showAuthNotification('You have successfully signed in')
        updateAuthUI();
        // Hide modal
        document.querySelector('#loginModal').classList.add('hidden');
    } else {
        showAuthNotification('Invalid email or password');
    }
}

//Hanldes logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    showAuthNotification("You have been logged out")
    updateAuthUI();
}
//return true or false
function isLoggedIn() {
    return !!localStorage.getItem('currentUser');
}

//Handles the UI of the login
function updateAuthUI() {
    //select all user icon in mobile and desktop
    const userIcons = document.querySelectorAll('#userIcon');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
   
    
    userIcons.forEach(icon => {
        // Assuming there's some element to display the user name
        const usernameDisplay = icon.parentElement.querySelector('.username-display');
        if (currentUser) {
            if (usernameDisplay) {
                usernameDisplay.classList.remove('hidden');
                usernameDisplay.textContent = currentUser.name;
            }
            icon.title = 'Click to logout';
        } else {
            if (usernameDisplay) {
                usernameDisplay.classList.add('hidden');
                usernameDisplay.textContent = '';
                
            }
            icon.title = 'Click to login';
        }
    });
}

//Call function below when content has loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchPartialsAndInitializeHeader();
});

//Make the partial html work in every file
function fetchPartialsAndInitializeHeader() {
    //fetch
    Promise.all([
        fetch('partials/header.html').then(response => response.text()),
        fetch('partials/modal.html').then(response => response.text()),
        fetch('partials/footer.html').then(response => response.text())
    ])
    //get
    .then(([headerData, modalData, footerData]) => {
        document.getElementById('header').innerHTML = headerData;
        document.getElementById('modal-container').innerHTML = modalData;
        initializeHeader();
        document.getElementById('footer').innerHTML = footerData;

        if (window.storeUtils) {
            window.storeUtils.initializeCartIcons();
            window.storeUtils.updateUI();
        }
    })
    .catch(error => console.error('Error loading partials:', error));
}
