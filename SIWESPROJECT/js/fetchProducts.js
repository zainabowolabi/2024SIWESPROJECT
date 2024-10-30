async function fetchProductData() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not fetch product data:", error);
        return { saleProducts: [], newProducts: [] };
    }
}

//declared parseNairaPrice here and use it in other js file
function parseNairaPrice(priceString) {
    // Remove the Naira symbol and commas, then parse as float
    return parseFloat(priceString.replace('₦', '').replace(',', '').replace(/[^0-9.-]+/g, ""));
}

//to give the number decimal places
function formatNairaPrice(price) {
    return `₦${price.toFixed(2)}`;
}


function createProductCard(product, isSale = false) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden group w-60 flex flex-col h-full';

    if (!product.id) {
        product.id = crypto.randomUUID();
    };

    let normalizedProduct = {
        ...product,
        id: product.id,
        name: product.name,
        image: product.image
    };

    if (isSale) {
        // For sale items
        normalizedProduct.currentPrice = parseNairaPrice(product.currentPrice); 
        normalizedProduct.originalPrice = parseNairaPrice(product.originalPrice);
        normalizedProduct.price = product.currentPrice; // For sale item, the product price is currentPrice
    } else {
        // For regular items
        const parsedPrice = parseNairaPrice(product.price);
        normalizedProduct.currentPrice = parsedPrice;
        normalizedProduct.price = product.price; // For normal item, the product price is price
    }
    
    let priceHTML = isSale
    //for sale, show slashed and current price 
        ? `<span class="text-gray-400 line-through">${product.originalPrice}</span>
           <span class="text-emerald-600 font-bold">${product.currentPrice}</span>`
        : `<span class="text-emerald-600 font-bold">${product.price}</span>`; //show only current price

    card.innerHTML = `
        
                <div class="relative mb-2">
                    ${isSale ? `<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">-${product.discount}</span>` : ''}
                    <div class="p-4 flex items-center justify-center h-64 bg-white-100"> <!-- Fixed height for image -->
                        <img src="${product.image}" alt="${product.name}" 
                             class="max-h-full h-64 object-contain group-hover:scale-105 transition-transform duration-300">
                    </div>
                </div>
                <div class="p-4 flex-grow"> <!-- Allow this div to grow -->
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
                    <div class="flex items-center space-x-2 mb-4">
                        ${priceHTML}
                    </div>
                </div>
                <div class="flex justify-between items-center p-4"> <!-- Buttons at the bottom -->
                    <button class="wishlist-btn text-gray-600 hover:text-red-500 transition-colors">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="add-to-cart bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors" data-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
    `;
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Add to cart clicked for product:', normalizedProduct);
        const cartProduct = {
            id: normalizedProduct.id,
            name: normalizedProduct.name,
            currentPrice: normalizedProduct.currentPrice,
            price: normalizedProduct.price, // This keeps the formatted string with ₦
            image: normalizedProduct.image
        };
        
        console.log('Adding to cart:', cartProduct);
        
        window.storeUtils.store.cart.add(cartProduct);
        window.storeUtils.showNotification(`${normalizedProduct.name} added to cart!`);
    });

    const wishlistBtn = card.querySelector('.wishlist-btn');
    wishlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.storeUtils.store.wishlist.toggle(normalizedProduct);
        window.storeUtils.showNotification(`${normalizedProduct.name} ${window.storeUtils.store.wishlist.isInWishlist(normalizedProduct.id) ? 'added to' : 'removed from'} wishlist!`);
    });



    return card;
}

// Function to render products
function renderProducts(products, containerId, isSale = false) {
    const container = document.getElementById(containerId);
    products.forEach(product => {
        container.appendChild(createProductCard(product, isSale));
    });
}

// Render products when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const { saleProducts, newProducts } = await fetchProductData();
    renderProducts(saleProducts, 'sale-products', true);
    renderProducts(newProducts, 'new-products-grid');
});

window.utils = {
    parseNairaPrice:parseNairaPrice,
    formatNairaPrice:formatNairaPrice
};