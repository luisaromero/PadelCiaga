const cart = [];

const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

document.querySelectorAll(".add-cart-btn").forEach(button => {

    button.addEventListener("click", () => {

        cart.push({

            name: button.dataset.name,
            price: Number(button.dataset.price)

        });

        renderCart();

        button.textContent = "✓ Added";

        setTimeout(() => {

            button.textContent = "Add to cart";

        }, 1000);

    });

});

function renderCart() {

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(product => {

        total += product.price;

        cartItems.innerHTML += `

            <div class="cart-item">

                <span>${product.name}</span>

                <strong>$${product.price}</strong>

            </div>

        `;

    });

    if (cart.length === 0) {

        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';

    }

    cartCount.textContent = cart.length;

    cartTotal.textContent = "$" + total.toLocaleString();

}