// Ebooks data is loaded from ebook_data.js

let cart = [];
let currentBundle = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Ebooks:', ebooks);
    renderEbooks(ebooks);
    setupFilters();
    setupCart();
    setupBundles();
    setupNavigation();
    setupEventListeners();
    setupPayPal();
});

function setupEventListeners() {
    // Use event delegation for dynamic content
    document.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            const id = addToCartBtn.getAttribute('data-id');
            addToCart(id);
            return;
        }

        const viewDetailEl = e.target.closest('.view-detail');
        if (viewDetailEl) {
            const id = viewDetailEl.getAttribute('data-id');
            showProductDetail(id);
            return;
        }
    });
}

function renderEbooks(data) {
    const container = document.getElementById('ebook-container');
    if (!container) return;
    container.innerHTML = '';

    data.forEach(ebook => {
        const card = document.createElement('div');
        card.className = 'ebook-card';
        card.innerHTML = `
            <div class="ebook-img" style="cursor: pointer;">
                <img src="${ebook.image}" alt="${ebook.title}" data-id="${ebook.id}" class="view-detail">
            </div>
            <div class="ebook-content">
                <span class="ebook-category">${ebook.category.replace('-', ' ')}</span>
                <h3 class="view-detail" data-id="${ebook.id}" style="cursor: pointer;">${ebook.title}</h3>
                <p>${ebook.description}</p>
                <div class="ebook-footer">
                    <span class="price">$${ebook.price.toFixed(2)}</span>
                    <button class="btn btn-primary add-to-cart" data-id="${ebook.id}">Add to Cart</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function showProductDetail(id) {
    const ebook = ebooks.find(e => e.id === id);
    if (!ebook) return;

    const mainContent = document.getElementById('main-content');
    const productDetail = document.getElementById('product-detail');
    const detailContent = document.getElementById('detail-content');

    mainContent.style.display = 'none';
    productDetail.style.display = 'block';

    detailContent.innerHTML = `
        <div style="display: flex; gap: 40px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
                <img src="${ebook.image}" alt="${ebook.title}" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
            </div>
            <div style="flex: 1.5; min-width: 300px;">
                <span class="ebook-category">${ebook.category.replace('-', ' ')}</span>
                <h2 style="font-size: 2.5rem; margin-bottom: 20px;">${ebook.title}</h2>
                <div class="price" style="font-size: 2rem; margin-bottom: 20px;">$${ebook.price.toFixed(2)}</div>
                <p style="font-size: 1.1rem; margin-bottom: 30px; line-height: 1.8;">${ebook.longDescription}</p>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #fde68a;">
                    <strong>What's inside:</strong>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>Step-by-step actionable guide</li>
                        <li>High-quality illustrations & tips</li>
                        <li>PDF format, works on all devices</li>
                        <li>Instant delivery to your inbox</li>
                    </ul>
                </div>

                <button class="btn btn-primary btn-large add-to-cart" data-id="${ebook.id}" style="padding: 15px 40px; font-size: 1.2rem;">Add to Cart</button>
            </div>
        </div>
    `;

    window.scrollTo(0, 0);
}

function setupNavigation() {
    const backBtn = document.getElementById('back-to-browse');
    if (backBtn) {
        backBtn.onclick = () => {
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('product-detail').style.display = 'none';
        };
    }

    // Handle hash changes for filters
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#ebooks') {
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('product-detail').style.display = 'none';
        }
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            if (category === 'all') {
                renderEbooks(ebooks);
            } else {
                const filtered = ebooks.filter(e => e.category === category);
                renderEbooks(filtered);
            }
        });
    });
}

function addToCart(id) {
    console.log('Adding to cart:', id);
    const ebook = ebooks.find(e => e.id === id);
    if (ebook && !cart.find(item => item.id === id)) {
        cart.push(ebook);
        updateCartUI();
        
        // Feedback
        const btns = document.querySelectorAll(`.add-to-cart[data-id="${id}"]`);
        btns.forEach(btn => {
            const originalText = btn.innerText;
            btn.innerText = 'Added!';
            btn.classList.add('btn-secondary');
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('btn-secondary');
            }, 1500);
        });
    }
}

function updateCartUI() {
    const count = document.getElementById('cart-count');
    if (count) count.innerText = cart.length + (currentBundle ? 1 : 0);
}

function setupBundles() {
    const bundleButtons = document.querySelectorAll('.buy-bundle');
    bundleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.getAttribute('data-type');
            if (type === 'all-access') {
                currentBundle = { title: "All Access Pass", price: 10.00 };
                alert('All Access Pass added to cart!');
            } else {
                alert('Add 5 individual ebooks to your cart to automatically get the $4 Starter Bundle price!');
                document.getElementById('ebooks').scrollIntoView();
            }
            updateCartUI();
        });
    });
}

function setupCart() {
    const cartIcon = document.querySelector('.cart-icon');
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.querySelector('.close');

    if (cartIcon) {
        cartIcon.onclick = () => {
            if (cart.length === 0 && !currentBundle) {
                alert('Your cart is empty!');
                return;
            }
            showCheckout();
            modal.style.display = "block";
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
            resetCheckoutForm();
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
            resetCheckoutForm();
        }
    };
    }

    function resetCheckoutForm() {
    document.getElementById('checkout-form-container').style.display = 'block';
    document.querySelector('.total').style.display = 'block';
    const cartItems = document.getElementById('cart-items');
    if (cartItems.querySelector('h3')) {
         cartItems.innerHTML = '';
    }
}

function processPayment(email) {
    const processingDelay = 500;

    setTimeout(() => {
        alert(`Thank you for your purchase! We've sent your ebooks to ${email}. You can also download them below.`);
        
        // Show download links
        const cartItems = document.getElementById('cart-items');
        cartItems.innerHTML = '<h3>Your Downloads:</h3>';
        
        if (currentBundle) {
            if (currentBundle.title === "All Access Pass") {
                // Show all available ebooks
                const header = document.createElement('h4');
                header.innerText = "All Access Library:";
                cartItems.appendChild(header);
                ebooks.forEach(item => {
                    const link = createDownloadLink(item.title, item.pdfPath);
                    cartItems.appendChild(link);
                });
            } else {
                const link = createDownloadLink(currentBundle.title);
                cartItems.appendChild(link);
            }
        }

        cart.forEach(item => {
            const link = createDownloadLink(item.title, item.pdfPath);
            cartItems.appendChild(link);
        });
        
        // Hide payment form details and PayPal buttons
        document.getElementById('payment-form').style.display = 'none';
        document.getElementById('checkout-form-container').style.display = 'none';
        document.querySelector('.total').style.display = 'none';
        
        cart = [];
        currentBundle = null;
        updateCartUI();
    }, processingDelay);
}

function setupPayPal() {
    if (typeof paypal === 'undefined') {
        console.warn('PayPal SDK not loaded yet, retrying...');
        setTimeout(setupPayPal, 1000);
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            const total = calculateTotal();
            if (total <= 0) {
                alert('Your cart is empty or total is 0.');
                return;
            }
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2)
                    },
                    description: currentBundle ? currentBundle.title : `${cart.length} Daily Dollar Ebooks`
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                const email = document.getElementById('checkout-email').value || details.payer.email_address;
                processPayment(email);
            });
        },
        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('Payment could not be processed. Please try again.');
        }
    }).render('#paypal-button-container');
}

function createDownloadLink(title, pdfPath) {
    const link = document.createElement('a');
    link.href = pdfPath || '#';
    link.download = `${title}.pdf`;
    link.className = 'btn btn-secondary';
    link.style.display = 'block';
    link.style.marginBottom = '10px';
    link.style.textAlign = 'center';
    link.innerText = `Download ${title} (PDF)`;
    if (!pdfPath) {
        link.onclick = (e) => {
            e.preventDefault();
            alert(`Download for ${title} is coming soon!`);
        };
    }
    return link;
}

function calculateTotal() {
    let total = 0;
    if (currentBundle) {
        total += currentBundle.price;
    }
    total += cart.reduce((sum, item) => sum + item.price, 0);

    // Bundle discount: 5 for $4
    if (cart.length === 5) {
        total -= 1.00;
    }
    return total;
}

function showCheckout() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    
    if (currentBundle) {
        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `<span>${currentBundle.title}</span> <span>$${currentBundle.price.toFixed(2)}</span>`;
        cartItems.appendChild(div);
    }

    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `<span>${item.title}</span> <span>${item.price.toFixed(2)}</span>`;
        cartItems.appendChild(div);
    });

    // Bundle discount: 5 for $4
    if (cart.length === 5) {
        const discountDiv = document.createElement('div');
        discountDiv.className = 'cart-item-row discount';
        discountDiv.innerHTML = `<span>Starter Bundle Discount</span> <span>-$1.00</span>`;
        cartItems.appendChild(discountDiv);
    }

    cartTotal.innerText = `$${calculateTotal().toFixed(2)}`;
}
