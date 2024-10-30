let productData = {
    saleProducts: [],
    newProducts: []
};

let currentFilters = {
    minPrice: 0,
    maxPrice: 0,
    inStock: false,
    onSale: false
};

let currentSort = 'popularity';
let isMobileFilterOpen = false;

// Utility functions
const getNumericPrice = (priceStr) => {
    return parseFloat(priceStr.replace('₦', ''));
};

function parseNairaPrice(priceString) {
    // Remove the Naira symbol and commas, then parse as float
    return parseFloat(priceString.replace('₦', '').replace(',', '').replace(/[^0-9.-]+/g, ""));
}

function formatNairaPrice(price) {
    return `₦${price.toFixed(2)}`;

}
const getAllProducts = () => {
    return [...productData.saleProducts, ...productData.newProducts];
};

const getPriceRange = (products) => {
    let prices = products.map(product => {
        return getNumericPrice(product.currentPrice || product.price);
    });
    
    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
};

const getInStockCount = (products) => {
    return products.filter(product => product.inStock).length;
};

const getDealsCount = (products) => {
    return products.filter(product => product.originalPrice || product.oldPrice).length;
};

// Filter functions
const applyFilters = (products) => {
    return products.filter(product => {
        const currentPrice = getNumericPrice(product.currentPrice || product.price);
        
        const priceMatch = currentPrice >= currentFilters.minPrice && 
                          currentPrice <= currentFilters.maxPrice;
        const stockMatch = !currentFilters.inStock || product.inStock;
        const saleMatch = !currentFilters.onSale || (product.originalPrice !== undefined);
        
        return priceMatch && stockMatch && saleMatch;
    });
};

const sortProducts = (products) => {
    const getPrice = (product) => {
        return getNumericPrice(product.currentPrice || product.price);
    };

    switch(currentSort) {
        case 'price-low-high':
            return [...products].sort((a, b) => getPrice(a) - getPrice(b));
        case 'price-high-low':
            return [...products].sort((a, b) => getPrice(b) - getPrice(a));
        case 'popularity':
        default:
            return products;
    }
};

// DOM manipulation
const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden group';
    
    if (!product.id) {
        product.id = crypto.randomUUID();
    }

    const isOnSale = product.originalPrice !== undefined;

    let normalizedProduct = {
        ...product,
        id: product.id,
        name: product.name,
        image: product.image
    };

    if (isOnSale) {
        // For sale items
        normalizedProduct.currentPrice = parseNairaPrice(product.currentPrice);
        normalizedProduct.originalPrice = parseNairaPrice(product.originalPrice);
        normalizedProduct.price = product.currentPrice; // Keep the formatted price for display
    } else {
        // For regular items
        const parsedPrice = parseNairaPrice(product.price);
        normalizedProduct.currentPrice = parsedPrice;
        normalizedProduct.price = product.price;
    }

    let priceHTML = isOnSale
        ? `<span class="text-gray-400 line-through">${product.originalPrice}</span>
           <span class="text-emerald-600 font-bold">${product.currentPrice}</span>`
        : `<span class="text-emerald-600 font-bold">${product.price}</span>`;

    card.innerHTML = `
        <div class="relative">
            ${isOnSale ? `<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">-${product.discount}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
            <div class="flex items-center space-x-2 mb-4">
                ${priceHTML}
            </div>
            <div class="flex justify-between">
                <button class="wishlist-btn  text-gray-600 hover:text-red-500 transition-colors">
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
        
        // Create the cartProduct object
        const cartProduct = {
            id: normalizedProduct.id,
            name: normalizedProduct.name,
            currentPrice: normalizedProduct.currentPrice,
            price: normalizedProduct.price, // Keep the formatted string with ₦
            image: normalizedProduct.image
        };
        
        // Add the product to the cart
        window.storeUtils.store.cart.add(cartProduct);
        
        // Show notification
        window.storeUtils.showNotification(`${normalizedProduct.name} added to cart!`);
    });

    const wishlistBtn = card.querySelector('.wishlist-btn');
    wishlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.storeUtils.store.wishlist.toggle(normalizedProduct);
        window.storeUtils.showNotification(`${normalizedProduct.name} ${window.storeUtils.store.wishlist.isInWishlist(normalizedProduct.id) ? 'added to' : 'removed from'} wishlist!`);
    });

    return card;
};


const updateFilterInputs = (minPrice, maxPrice) => {
    ['', 'mobile-'].forEach(prefix => {
        const minInput = document.getElementById(`${prefix}min-price`);
        const maxInput = document.getElementById(`${prefix}max-price`);
        
        if (minInput) minInput.value = minPrice;
        if (maxInput) maxInput.value = maxPrice;
    });
};

const updateCheckboxStates = (inStock, onSale) => {
    ['', 'mobile-'].forEach(prefix => {
        const checkboxes = document.querySelectorAll(`.${prefix}filter-checkbox`);
        checkboxes.forEach((checkbox, index) => {
            if (index === 0) checkbox.checked = inStock;
            if (index === 1) checkbox.checked = onSale;
        });
    });
};

const updateFilterCounts = (allProducts) => {
    const inStockCount = getInStockCount(allProducts);
    const dealsCount = getDealsCount(allProducts);
    
    ['', 'mobile-'].forEach(prefix => {
        const inStockLabel = document.querySelector(`#${prefix}in-stock-count`);
        const dealsLabel = document.querySelector(`#${prefix}deals-count`);
        
        if (inStockLabel) inStockLabel.textContent = `(${inStockCount})`;
        if (dealsLabel) dealsLabel.textContent = `(${dealsCount})`;
    });
};

const updateProductGrid = () => {
    const productGrid = document.getElementById('product-grid');
    const filteredAndSortedProducts = sortProducts(applyFilters(getAllProducts()));
    
    if (!productGrid) return;
    
    if (filteredAndSortedProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
                <div class="text-gray-500">No products found matching your criteria</div>
            </div>
        `;
    } else {
        productGrid.innerHTML = '';
        filteredAndSortedProducts.forEach(product => {
            productGrid.appendChild(createProductCard(product));
        });
    }
    
    // Update product count
    const productCount = document.getElementById('product-count');
    if (productCount) {
        productCount.textContent = `${filteredAndSortedProducts.length} products found`;
    }
};

// Loading state
const showLoading = () => {
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
                <div class="text-gray-500">Loading products...</div>
            </div>
        `;
    }
};

// Event handlers setup
const setupFilterEventListeners = () => {
    // Mobile filter toggle
    const filterToggle = document.getElementById('filterToggle');
    const mobileFilter = document.getElementById('mobileFilter');
    
    if (filterToggle && mobileFilter) {
        filterToggle.addEventListener('click', () => {
            isMobileFilterOpen = !isMobileFilterOpen;
            mobileFilter.classList.toggle('hidden');
        });
    }

    // Apply filters
    ['applyFilter', 'mobile-applyFilter'].forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                const prefix = id.startsWith('mobile-') ? 'mobile-' : '';
                const minInput = document.getElementById(`${prefix}min-price`);
                const maxInput = document.getElementById(`${prefix}max-price`);
                
                if (minInput && maxInput) {
                    currentFilters.minPrice = Number(minInput.value);
                    currentFilters.maxPrice = Number(maxInput.value);
                    updateFilterInputs(currentFilters.minPrice, currentFilters.maxPrice);
                    updateProductGrid();
                    
                    // Close mobile filter if on mobile
                    if (prefix === 'mobile-') {
                        const mobileFilter = document.getElementById('mobileFilter');
                        if (mobileFilter) {
                            mobileFilter.classList.add('hidden');
                            isMobileFilterOpen = false;
                        }
                    }
                }
            });
        }
    });

    // Clear all filters
    ['clearAll', 'mobile-clearAll'].forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                const priceRange = getPriceRange(getAllProducts());
                currentFilters = {
                    minPrice: priceRange.min,
                    maxPrice: priceRange.max,
                    inStock: false,
                    onSale: false
                };
                
                updateFilterInputs(priceRange.min, priceRange.max);
                updateCheckboxStates(false, false);
                updateProductGrid();
                
                // Close mobile filter if on mobile
                if (id.startsWith('mobile-')) {
                    const mobileFilter = document.getElementById('mobileFilter');
                    if (mobileFilter) {
                        mobileFilter.classList.add('hidden');
                        isMobileFilterOpen = false;
                    }
                }
            });
        }
    });

    // Clear price
    ['clearPrice', 'mobile-clearPrice'].forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                const priceRange = getPriceRange(getAllProducts());
                currentFilters.minPrice = priceRange.min;
                currentFilters.maxPrice = priceRange.max;
                updateFilterInputs(priceRange.min, priceRange.max);
                updateProductGrid();
                
                // Close mobile filter if on mobile
                if (id.startsWith('mobile-')) {
                    const mobileFilter = document.getElementById('mobileFilter');
                    if (mobileFilter) {
                        mobileFilter.classList.add('hidden');
                        isMobileFilterOpen = false;
                    }
                }
            });
        }
    });

    // Filter checkboxes
    ['', 'mobile-'].forEach(prefix => {
        const checkboxes = document.querySelectorAll(`.${prefix}filter-checkbox`);
        checkboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', (e) => {
                if (index === 0) currentFilters.inStock = e.target.checked;
                if (index === 1) currentFilters.onSale = e.target.checked;
                updateCheckboxStates(currentFilters.inStock, currentFilters.onSale);
                updateProductGrid();
            });
        });
    });

    // Sort handlers
    ['sort', 'mobile-sort'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', (e) => {
                currentSort = e.target.value;
                // Update other sort selects
                ['sort', 'mobile-sort'].forEach(otherId => {
                    const otherSelect = document.getElementById(otherId);
                    if (otherSelect && otherSelect !== select) {
                        otherSelect.value = currentSort;
                    }
                });
                updateProductGrid();
            });
        }
    });
};

// Initialize application
const initializeApp = async () => {
    try {
        showLoading();
        
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        productData = await response.json();
        const allProducts = getAllProducts();
        const priceRange = getPriceRange(allProducts);
        
        currentFilters.minPrice = priceRange.min;
        currentFilters.maxPrice = priceRange.max;
        
        updateFilterInputs(priceRange.min, priceRange.max);
        updateFilterCounts(allProducts);
        updateProductGrid();
        setupFilterEventListeners();
        
    } catch (error) {
        console.error('Error loading products:', error);
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="col-span-full flex justify-center items-center py-12">
                    <div class="text-red-500">Error loading products. Please try again later.</div>
                </div>
            `;
        }
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeApp);