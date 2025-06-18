// script.js
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Agregar producto al carrito
    document.querySelectorAll('.btn-agregar-pro').forEach(button => {
        button.addEventListener('click', () => {
            const product = button.getAttribute('data-product');
            const price = parseFloat(button.getAttribute('data-price'));
            const image = button.getAttribute('data-image');
            const quantity = 1;

            const item = cart.find(item => item.product === product);
            if (item) {
                item.quantity += quantity;
            } else {
                cart.push({ product, price, image, quantity });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showNotification(`¡${product} agregado al carrito!`);
            updateCartDisplay();
        });
    });

    // Actualizar contador del carrito
    function updateCartCount() {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-icon').forEach(icon => {
            icon.textContent = `( ${cartCount} )`;
        });
    }

    // Mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Asegurar que la notificación se elimine después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Estilo básico para la notificación (si no está en styles.css)
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 20px';
        notification.style.backgroundColor = '#d4af37';
        notification.style.color = '#000';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
    }

    // Actualizar visualización del carrito
    function updateCartDisplay() {
        const cartItems = document.getElementById('carrito-items');
        if (cartItems) {
            cartItems.innerHTML = '';
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'carrito-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.product}">
                    <div class="item-info">
                        <h4>${item.product}</h4>
                        <span class="price">S/ ${item.price.toFixed(2)}</span>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>
                    <button class="remove-btn" data-product="${item.product}"><i class="fas fa-trash"></i></button>
                `;
                cartItems.appendChild(cartItem);

                // Control de cantidad
                cartItem.querySelectorAll('.quantity-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const action = btn.getAttribute('data-action');
                        const input = cartItem.querySelector('.quantity-input');
                        let quantity = parseInt(input.value);
                        if (action === 'increase') quantity++;
                        else if (action === 'decrease' && quantity > 1) quantity--;
                        input.value = quantity;
                        item.quantity = quantity;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartDisplay();
                        updateSummary();
                    });
                });

                // Eliminar producto
                cartItem.querySelector('.remove-btn').addEventListener('click', () => {
                    cart = cart.filter(i => i.product !== item.product);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartDisplay();
                    updateCartCount();
                    updateSummary();
                });
            });
            updateSummary();
        }
    }

    // Actualizar resumen del carrito
    function updateSummary() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal; // Sin costo de envío por ahora
        document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;
    }

    // Cargar carrito al iniciar
    updateCartCount();
    updateCartDisplay();

    // Botón de pago (simulación)
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', () => {
            if (cart.length > 0) {
                alert('¡Pago realizado con éxito! Gracias por tu compra.');
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
                updateCartCount();
            } else {
                alert('Tu carrito está vacío.');
            }
        });
    }
});