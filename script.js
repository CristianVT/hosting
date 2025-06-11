// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 0;
const itemsPerPage = 16; // 4x4
let filteredProducts = [];

function showSection(sectionId) {
    const sections = ['hero', 'catalog', 'cart', 'checkout', 'about'];
    sections.forEach(id => {
        document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
    });
    if (sectionId === 'catalog') updateProductGrid();
    if (sectionId === 'cart') updateCart();
    if (sectionId === 'checkout') updateCheckout();
    // Mostrar el carrusel solo en la página de inicio
    const featuredCarousel = document.getElementById('featured-products-carousel');
    const whyChoose = document.getElementById('why-choose');
    if (featuredCarousel && whyChoose) {
        featuredCarousel.classList.toggle('active', sectionId === 'hero');
        whyChoose.classList.toggle('active', sectionId === 'hero');
    }
    if (sectionId === 'catalog') updateProductGrid();
}

function updateProductGrid() {
    const productsToShow = filteredProducts.length ? filteredProducts : document.querySelectorAll('.product-item');
    const totalPages = Math.ceil(productsToShow.length / itemsPerPage);
    productsToShow.forEach((product, index) => {
        product.style.display = (index >= currentPage * itemsPerPage && index < (currentPage + 1) * itemsPerPage) ? 'block' : 'none';
    });
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i + 1;
        button.addEventListener('click', () => {
            currentPage = i;
            updateProductGrid();
        });
        if (i === currentPage) button.classList.add('active');
        pagination.appendChild(button);
    }
}

function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    filteredProducts = Array.from(document.querySelectorAll('.product-item')).filter(product => 
        product.getAttribute('data-name').toLowerCase().includes(searchTerm)
    );
    currentPage = 0;
    updateProductGrid();
}

function filterProducts(filter) {
    let products = Array.from(document.querySelectorAll('.product-item'));
    if (filter === 'a-z') {
        products.sort((a, b) => a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')));
    } else if (filter === 'z-a') {
        products.sort((a, b) => b.getAttribute('data-name').localeCompare(a.getAttribute('data-name')));
    }
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';
    products.forEach(product => productGrid.appendChild(product));
    currentPage = 0;
    filteredProducts = products;
    updateProductGrid();
}

document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product-item');
            if (product) {
                const name = product.getAttribute('data-name');
                const price = parseFloat(product.getAttribute('data-price'));
                const imgSrc = product.querySelector('img').src;
                let item = cart.find(item => item.name === name);
                if (item) {
                    item.quantity++;
                } else {
                    cart.push({ name, price, quantity: 1, imgSrc, category: product.getAttribute('data-category') });
                }
                saveCart();
                showNotification(`Producto agregado: ${name}`);
                updateCart();
            }
        });
    });

    const featuredProductsCarousel = $('#featured-products-carousel');
    if (featuredProductsCarousel.length) {
        featuredProductsCarousel.slick({
            lazyLoad: 'ondemand',
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    function updateCart() {
        const cartItems = document.getElementById('cart-items');
        const subtotalSpan = document.getElementById('subtotal');
        const totalSpan = document.getElementById('total');
        if (!cartItems || !subtotalSpan || !totalSpan) return;
        cartItems.innerHTML = '';
        let subtotal = 0;
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>No hay nada en el carrito</p>';
        } else {
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.imgSrc}" alt="${item.name}">
                    <div class="product-info">
                        <p>${item.name}</p>
                        <p>S/ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="remove-item">-</button>
                        <span>${item.quantity}</span>
                        <button class="add-item">+</button>
                        <button class="delete-item">🗑️</button>
                    </div>
                `;
                cartItems.appendChild(div);
            });
        }
        subtotalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;
        totalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                const itemName = button.parentElement.parentElement.querySelector('.product-info p:first-child').textContent;
                const item = cart.find(item => item.name === itemName);
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(i => i.name !== itemName);
                }
                saveCart();
                updateCart();
            });
        });
        document.querySelectorAll('.add-item').forEach(button => {
            button.addEventListener('click', () => {
                const itemName = button.parentElement.parentElement.querySelector('.product-info p:first-child').textContent;
                const item = cart.find(item => item.name === itemName);
                item.quantity++;
                saveCart();
                updateCart();
            });
        });
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', () => {
                const itemName = button.parentElement.parentElement.querySelector('.product-info p:first-child').textContent;
                cart = cart.filter(i => i.name !== itemName);
                saveCart();
                updateCart();
            });
        });
    }

    document.getElementById('proceed-payment').addEventListener('click', () => {
        if (cart.length > 0) {
            showSection('checkout');
            updateCheckout();
        } else {
            showNotification('No hay nada en el carrito');
        }
    });

    const discountCodes = { 'DESC10': 0.10, 'DESC20': 0.20 };
    document.getElementById('apply-discount').addEventListener('click', () => {
        const code = document.getElementById('discount-code').value;
        if (discountCodes[code]) {
            let subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('S/ ', ''));
            const discount = subtotal * discountCodes[code];
            const total = subtotal - discount;
            document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;
            showNotification(`Descuento del ${discountCodes[code] * 100}% aplicado!`);
        } else {
            showNotification('Código de descuento inválido!');
        }
    });

    document.getElementById('confirm-payment').addEventListener('click', () => {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!name || !email || !phone || !address) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            alert('El nombre solo debe contener letras y espacios.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Ingresa un correo electrónico válido.');
            return;
        }
        if (!/^\d{9}$/.test(phone)) {
            alert('El teléfono debe tener 9 dígitos.');
            return;
        }

        if (paymentMethod) {
            if (paymentMethod.value === 'card' && !validateCardDetails()) {
                return;
            }
            alert(`¡Pago realizado con éxito con ${paymentMethod.value}! Gracias por tu compra.`);
            cart = [];
            saveCart();
            showSection('hero');
        } else {
            alert('Por favor, selecciona un método de pago.');
        }
    });

    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const cardDetails = document.querySelector('.card-details');
            const paymentOptions = document.querySelectorAll('.payment-option');
            paymentOptions.forEach(option => option.classList.remove('active'));
            if (radio.checked) {
                radio.parentElement.classList.add('active');
                if (radio.value === 'card') {
                    cardDetails.style.display = 'block';
                } else {
                    cardDetails.style.display = 'none';
                }
            }
        });
    });

    function updateCheckout() {
        const orderSummary = document.getElementById('order-summary');
        const finalTotalSpan = document.getElementById('final-total');
        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        const checkoutTotal = document.getElementById('checkout-total');
        if (!orderSummary || !finalTotalSpan || !checkoutSubtotal || !checkoutTotal) return;
        orderSummary.innerHTML = '';
        let subtotal = 0;
        if (!cart || cart.length === 0) {
            orderSummary.innerHTML = '<p>No hay productos en el pedido.</p>';
        } else {
            cart.forEach(item => {
                if (item && item.name && item.quantity && item.price) {
                    const totalItemPrice = item.price * item.quantity;
                    subtotal += totalItemPrice;
                    const p = document.createElement('p');
                    p.innerHTML = `${item.name} x${item.quantity} <span>S/ ${totalItemPrice.toFixed(2)}</span>`;
                    orderSummary.appendChild(p);
                }
            });
        }
        checkoutSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
        finalTotalSpan.textContent = `${subtotal.toFixed(2)}`;
        checkoutTotal.textContent = `S/ ${subtotal.toFixed(2)}`;
    }

    function showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.style.display = 'block';
            notification.style.opacity = '1';
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.style.display = 'none', 300);
            }, 3000);
        }
    }

    function validateCardDetails() {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        if (!/^\d{16}$/.test(cardNumber)) {
            alert('El número de tarjeta debe tener 16 dígitos.');
            return false;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            alert('La fecha de vencimiento debe tener el formato MM/AA.');
            return false;
        }
        if (!/^\d{3,4}$/.test(cvv)) {
            alert('El CVV debe tener 3 o 4 dígitos.');
            return false;
        }
        return true;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
});