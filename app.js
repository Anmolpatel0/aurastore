let cart = [];
let wishlist = [];

const routes = {
    '#/': renderHome,
    '#/shop': renderShop,
    '#/wishlist': renderWishlist,
    '#/cart': renderCart
};

function router() {
    const hash = window.location.hash || '#/';
    const view = routes[hash] || renderHome;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        if(link.getAttribute('href') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    view(document.getElementById('app'));
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

function updateBadges() {
    document.getElementById('cart-count').textContent = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('wishlist-count').textContent = wishlist.length;
}

// Home View
function renderHome(container) {
    container.innerHTML = `
        <div class="hero">
            <h1>Elevate Your Everyday Lifestyle</h1>
            <p>Discover curated collections of premium apparel, tech accessories, and timeless essentials designed with aesthetic precision.</p>
            <a href="#/shop" class="btn-primary">Explore Collection</a>
        </div>
    `;
}

// Shop View
async function renderShop(container) {
    container.innerHTML = `<div class="loader"><i class="fa-solid fa-spinner fa-spin"></i> Curating catalog...</div>`;

    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const products = await res.json();

        let html = `<h2 class="section-title">All Products</h2><div class="products-grid">`;
        products.forEach(p => {
            const isWishlisted = wishlist.some(item => item.id === p.id);
            html += `
                <div class="product-card">
                    <div class="product-img-wrapper">
                        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="window.toggleWishlist(${p.id}, '${p.title.replace(/'/g, "")}', ${p.price}, '${p.image}')">
                            <i class="${isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                        </button>
                        <img src="${p.image}" alt="${p.title}" class="product-img">
                    </div>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-footer">
                        <span class="product-price">$${p.price.toFixed(2)}</span>
                        <button class="add-cart-btn" onclick="window.addToCart(${p.id}, '${p.title.replace(/'/g, "")}', ${p.price}, '${p.image}')">
                            <i class="fa-solid fa-bag-shopping"></i> Add
                        </button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="loader">Failed to load catalog. Please check your internet connection.</div>`;
    }
}

// Wishlist Actions & View
window.toggleWishlist = function(id, title, price, image) {
    const index = wishlist.findIndex(item => item.id === id);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push({ id, title, price, image });
    }
    updateBadges();
    // Re-render current view if on shop or wishlist
    const hash = window.location.hash || '#/';
    if (hash === '#/shop') renderShop(document.getElementById('app'));
    if (hash === '#/wishlist') renderWishlist(document.getElementById('app'));
};

function renderWishlist(container) {
    if (wishlist.length === 0) {
        container.innerHTML = `
            <h2 class="section-title">Your Wishlist</h2>
            <div style="text-align:center; padding:60px 0; color:#78716c;">
                <i class="fa-regular fa-heart" style="font-size:3rem; margin-bottom:16px; color:#d6d3d1;"></i>
                <p>Your wishlist is currently empty.</p>
                <a href="#/shop" style="color:#d97706; text-decoration:none; font-weight:600; margin-top:12px; display:inline-block;">Explore products</a>
            </div>
        `;
        return;
    }

    let html = `<h2 class="section-title">Your Wishlist</h2><div class="products-grid">`;
    wishlist.forEach(p => {
        html += `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <button class="wishlist-btn active" onclick="window.toggleWishlist(${p.id})">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <img src="${p.image}" alt="${p.title}" class="product-img">
                </div>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-footer">
                    <span class="product-price">$${p.price.toFixed(2)}</span>
                    <button class="add-cart-btn" onclick="window.addToCart(${p.id}, '${p.title.replace(/'/g, "")}', ${p.price}, '${p.image}'); window.toggleWishlist(${p.id});">
                        Move to Bag
                    </button>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// Cart Actions & View
window.addToCart = function(id, title, price, image) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, title, price, image, qty: 1 });
    }
    updateBadges();
};

function renderCart(container) {
    if (cart.length === 0) {
        container.innerHTML = `
            <h2 class="section-title">Shopping Bag</h2>
            <div style="text-align:center; padding:60px 0; color:#78716c;">
                <i class="fa-solid fa-bag-shopping" style="font-size:3rem; margin-bottom:16px; color:#d6d3d1;"></i>
                <p>Your shopping bag is empty.</p>
                <a href="#/shop" style="color:#d97706; text-decoration:none; font-weight:600; margin-top:12px; display:inline-block;">Start shopping</a>
            </div>
        `;
        return;
    }

    let total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    let html = `<h2 class="section-title">Shopping Bag</h2><div style="display:flex; flex-direction:column; gap:16px; max-width:800px;">`;
    
    cart.forEach(item => {
        html += `
            <div style="display:flex; align-items:center; justify-content:space-between; background:white; padding:16px 20px; border-radius:12px; border:1px solid #e7e5e4;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <img src="${item.image}" style="width:70px; height:70px; object-fit:contain; background:#f5f5f4; padding:8px; border-radius:8px;">
                    <div>
                        <h4 style="font-size:1rem; font-weight:600; color:#0f172a; margin-bottom:4px;">${item.title}</h4>
                        <p style="color:#78716c; font-size:0.9rem;">$${item.price.toFixed(2)} &times; ${item.qty}</p>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:16px;">
                    <span style="font-weight:700; color:#0f172a;">$${(item.price * item.qty).toFixed(2)}</span>
                    <button onclick="window.removeFromCart(${item.id})" style="background:#fee2e2; color:#dc2626; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justifyContent:center;"><i class="fa-solid fa-trash-can" style="margin:auto;"></i></button>
                </div>
            </div>
        `;
    });

    html += `
        <div style="background:white; padding:24px; border-radius:12px; border:1px solid #e7e5e4; display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <div>
                <span style="color:#78716c; font-size:0.9rem; display:block;">Total Amount</span>
                <h3 style="font-size:1.5rem; font-weight:700; color:#0f172a;">$${total.toFixed(2)}</h3>
            </div>
            <button onclick="alert('Order placed successfully! Thank you for shopping with AuraStore.'); window.clearCart();" class="btn-primary" style="border:none; cursor:pointer;">Proceed to Checkout</button>
        </div>
    </div>`;

    container.innerHTML = html;
}

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateBadges();
    renderCart(document.getElementById('app'));
};

window.clearCart = function() {
    cart = [];
    updateBadges();
    window.location.hash = '#/';
};
