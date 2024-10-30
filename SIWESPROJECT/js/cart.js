       
// The main data store containing the `cart` and `wishlist` objects with their methods
const store = {
    // Cart object to manage shopping cart items
    cart: {
        // Initialize items by retrieving from local storage or setting to an empty array if not available
        items: JSON.parse(localStorage.getItem('cart')) || [],
     // Save the current cart items to local storage as a JSON string
     save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    // Add a product to the cart
    add(product) {
        // Check if the product already exists in the cart
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            // If it exists, increase its quantity
            existingItem.quantity += 1;
        } else {
            // If it doesn't exist, add it as a new item with a quantity of 1 and parse the price
            this.items.push({
                ...product,
                quantity: 1,
                currentPrice: parseFloat(product.price.replace(/[^0-9.-]+/g, "")) // Parse price from string
            });
        }
        this.save(); // Save updated cart to local storage
        updateUI();   // Update the UI to reflect changes
    },

    // Remove a product from the cart by its ID
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId); // Filter out the item
        this.save();
        updateUI();
    },
         // Update quantity of a product in the cart
         updateQuantity(productId, quantity) {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                // Set the new quantity, ensuring it doesn't go below 0
                item.quantity = Math.max(0, quantity);
                // Remove the item if the quantity becomes 0
                if (item.quantity === 0) {
                    this.remove(productId);
                    return;
                }
            }
            this.save();
            updateUI();
        },

        // Calculate the total price of all items in the cart
        getTotal() {
            return this.items.reduce((total, item) => {
                return total + (item.currentPrice * item.quantity);
            }, 0); // Start from 0 and accumulate each item's total price
        }
    },

    // Wishlist object to manage wishlist items
    wishlist: {
        // Initialize items by retrieving from local storage or setting to an empty array if not available
        items: JSON.parse(localStorage.getItem('wishlist')) || [],

        // Save the current wishlist items to local storage as a JSON string
        save() {
            localStorage.setItem('wishlist', JSON.stringify(this.items));
        },

        // Toggle a product in the wishlist (add if not in wishlist, remove if already in)
        toggle(product) {
            const index = this.items.findIndex(item => item.id === product.id);
            if (index === -1) {
                // If product not in wishlist, add it
                this.items.push(product);
            } else {
                // If product already in wishlist, remove it
                this.items.splice(index, 1);
            }
            this.save(); // Save the wishlist to local storage
            updateUI();   // Update the UI to reflect changes
        },

        // Remove a product from the wishlist by its ID
        remove(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.save();
            updateUI();
        },

        // Check if a product is in the wishlist by its ID
        isInWishlist(productId) {
            return this.items.some(item => item.id === productId); // Returns true if product exists
        }
    }
};

// Update the user interface to reflect cart and wishlist changes
function updateUI() {
    // Update cart item count
    const cartCountElements = document.querySelectorAll('[aria-label="Cart items"]');
    const totalItems = store.cart.items.reduce((sum, item) => sum + item.quantity, 0); // Sum quantities
    cartCountElements.forEach(element => {
        element.textContent = totalItems; // Display total items in cart
    });

    // Update wishlist item count
    const wishlistCountElements = document.querySelectorAll('[aria-label="Wishlist items"]');
    wishlistCountElements.forEach(element => {
        element.textContent = store.wishlist.items.length; // Display number of items in wishlist
    });

    // Initialize cart and wishlist pages
    initializeCartPage();
    initializeWishlistPage();
}

// Initialize the cart page by displaying cart items or a message if empty
function initializeCartPage() {
    const cartContainer = document.querySelector('#cart-container');
    if (!cartContainer) return; // Exit if not on cart page

    if (store.cart.items.length === 0) {
        // Display empty cart message
        cartContainer.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-shopping-cart text-gray-400 text-5xl mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <p class="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
                <a href="/" class="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors">
                    Continue Shopping
                </a>
            </div>
        `;
        return;
    }

 // Display cart items and the total price
    cartContainer.innerHTML = `
        <div class="max-w-4xl mx-auto p-4">
            <h1 class="text-2xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
            <div id="cart-items" class="space-y-4"></div>
            <div class="flex justify-between items-center mt-8 pt-4 border-t">
                <a href="/" class="text-emerald-600 hover:text-emerald-700">
                    <i class="fas fa-arrow-left mr-2"></i>Continue Shopping
                </a>
                <div class="text-xl font-bold">
                    Total: <span id="cart-total">₦${store.cart.getTotal().toFixed(2)}</span>
                </div>
            </div>
            <div class="mt-8">
                <button id="checkout-button" class="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 transition-colors">
                    Proceed to Checkout
                </button>
            </div>
        </div>

         <!-- Email Modal -->
        <div id="email-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Almost there!</h2>
                    <p class="text-gray-600">Please enter your email to continue with checkout</p>
                </div>
                
                <form id="email-form" class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            id="email-input"
                            required
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="your@email.com"
                        >
                        <p id="email-error" class="mt-1 text-red-600 text-sm hidden">Please enter a valid email address</p>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <button 
                            type="submit"
                            class="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors"
                        >
                            Continue to Payment
                        </button>
                        <button 
                            type="button"
                            id="cancel-email"
                            class="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Add each item to the cart display
  const cartItemsContainer = document.querySelector('#cart-items');
  store.cart.items.forEach(item => {
      cartItemsContainer.appendChild(createCartItem(item));
  });

  // Add event listener to the checkout button
  const checkoutButton = document.querySelector('#checkout-button');
  if (checkoutButton) {
      checkoutButton.addEventListener('click', handleCheckout);
  }
}

function initializeWishlistPage() {
    const wishlistContainer = document.querySelector('#wishlist-container');
    if (!wishlistContainer) return; // Not on wishlist page

    if (store.wishlist.items.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-heart text-gray-400 text-5xl mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
                <p class="text-gray-600 mb-8">Save items you like for later.</p>
                <a href="/" class="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors">
                    Continue Shopping
                </a>
            </div>
        `;
        return;
    }
//Edit wishlist items
    wishlistContainer.innerHTML = `
        <div class="max-w-4xl mx-auto p-4">
            <h1 class="text-2xl font-bold text-gray-800 mb-8">My Wishlist</h1>
            <div id="wishlist-items" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            <div class="mt-8">
          
                <a href="/" class="text-emerald-600 hover:text-emerald-700">
                    <i class="fas fa-arrow-left mr-2"></i>Continue Shopping
                </a>
            </div>
        </div>
    `;

    const wishlistItemsContainer = document.querySelector('#wishlist-items');
    store.wishlist.items.forEach(item => {
        wishlistItemsContainer.appendChild(createWishlistItem(item));
    });
}

function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'flex items-center justify-between p-4 bg-white rounded-lg shadow';
    cartItem.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
            <div>
                <h3 class="font-semibold">${item.name}</h3>
                <p class="text-emerald-600">₦${item.currentPrice.toFixed(2)}</p>
            </div>
        </div>
        <div class="flex items-center space-x-4">
            <div class="flex items-center border rounded">
                <button class="quantity-btn minus px-3 py-1 hover:bg-gray-100" data-id="${item.id}">-</button>
                <input type="number" class="quantity-input w-16 text-center" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="quantity-btn plus px-3 py-1 hover:bg-gray-100" data-id="${item.id}">+</button>
            </div>
            <button class="remove-btn text-red-500 hover:text-red-700" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add event listeners
    const minusBtn = cartItem.querySelector('.minus');
    const plusBtn = cartItem.querySelector('.plus');
    const quantityInput = cartItem.querySelector('.quantity-input');
    const removeBtn = cartItem.querySelector('.remove-btn');

    minusBtn.addEventListener('click', () => {
        store.cart.updateQuantity(item.id, item.quantity - 1);
    });

    plusBtn.addEventListener('click', () => {
        store.cart.updateQuantity(item.id, item.quantity + 1);
    });

    quantityInput.addEventListener('change', (e) => {
        const newQuantity = parseInt(e.target.value) || 1;
        store.cart.updateQuantity(item.id, newQuantity);
    });

    removeBtn.addEventListener('click', () => {
        store.cart.remove(item.id);
    });

    return cartItem;
}

//Edit Product Card
function createWishlistItem(item) {
    const wishlistItem = document.createElement('div');
    wishlistItem.className = 'bg-white rounded-lg shadow-md overflow-hidden roup w-70 flex flex-col h-full';
    wishlistItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="max-h-full h-64 object-contain group-hover:scale-105 transition-transform duration-300">
        <div class="p-4" flex items-center justify-center h-64 bg-white-100>
            <h3 class="font-semibold mb-2">${item.name}</h3>
            <p class="text-emerald-600 mb-4">₦${parseFloat(item.price.replace(/[^0-9.-]+/g, "")).toFixed(2)}</p>
            <div class="flex justify-between items-center">
                <button class="remove-from-wishlist bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors" data-id="${item.id}">
                    Remove
                </button>
                <button class="add-to-cart bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 transition-colors" data-id="${item.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    // Add event listeners
    const removeBtn = wishlistItem.querySelector('.remove-from-wishlist');
    const addToCartBtn = wishlistItem.querySelector('.add-to-cart');

    removeBtn.addEventListener('click', () => {
        store.wishlist.remove(item.id);
    });
    //add to cart notification
    addToCartBtn.addEventListener('click', () => {
        store.cart.add(item);
        store.wishlist.remove(item.id);
        showNotification(`${item.name} added to cart!`);
    });

    return wishlistItem;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function handleCheckout() {
    const emailModal = document.getElementById('email-modal');
    const emailForm = document.getElementById('email-form');
    const emailInput = document.getElementById('email-input');
    const emailError = document.getElementById('email-error');
    const cancelButton = document.getElementById('cancel-email');

    // Show stored email if available
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        emailInput.value = storedEmail;
    }

    // Show modal
    emailModal.classList.remove('hidden');
    emailModal.classList.add('flex');

    // Focus email input
    emailInput.focus();

    // Handle form submission
    emailForm.onsubmit = (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailError.classList.remove('hidden');
            return;
        }

        // Hide error if previously shown
        emailError.classList.add('hidden');
        
        // Store email
        localStorage.setItem('userEmail', email);
        
        // Hide modal
        emailModal.classList.remove('flex');
        emailModal.classList.add('hidden');

        // Proceed with payment
        initializePayment(email);
    };

    // Handle cancel button
    cancelButton.onclick = () => {
        emailModal.classList.remove('flex');
        emailModal.classList.add('hidden');
    };

    // Close modal if clicking outside
    emailModal.onclick = (e) => {
        if (e.target === emailModal) {
            emailModal.classList.remove('flex');
            emailModal.classList.add('hidden');
        }
    };
}

function initializePayment(email) {
    const amountInKobo = Math.round(store.cart.getTotal() * 100);
    const reference = 'ORDER_' + Math.random().toString(36) + '_' + Date.now();

    const handler = PaystackPop.setup({
        key: "pk_test_95d6c7985241fb6332fbda131d8442533d9d1d58",
        email: email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: reference,
        metadata: {
            custom_fields: [
                {
                    display_name: "Cart Items",
                    variable_name: "cart_items",
                    value: JSON.stringify(store.cart.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.currentPrice
                    })))
                }
            ]
        },
        onClose: function() {
            showNotification('Checkout canceled');
        },
        callback: function(response) {
            handlePaymentSuccess(response);
        }
    });

    handler.openIframe();
}

function handlePaymentSuccess(response) {
    // Save order details
    const order = {
        reference: response.reference,
        items: store.cart.items,
        total: store.cart.getTotal(),
        status: 'paid',
        date: new Date().toISOString(),
        transaction: response
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear the cart
    store.cart.items = [];
    store.cart.save();

    // Show success message
    showNotification('Payment successful! Thank you for your order.');

    // Redirect to order confirmation page
    setTimeout(() => {
        window.location.href = `/?ref=${response.reference}`;
    }, 2000);
}

//use storeutilis object elsewhere
window.storeUtils = {
    updateUI: updateUI,
    showNotification:showNotification,
    store:store,
    initializeCartIcons: function() {
        const cartIcons = document.querySelectorAll('#cart-icon, #mobile-cart-icon');
        const wishlistIcons = document.querySelectorAll('#wishlist-icon, #mobile-wishlist-icon');
    
        cartIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                window.location.href = '/cart.html';
            });
        });
    
        wishlistIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                window.location.href = '/wishlist.html';
            });
        });
    }
};