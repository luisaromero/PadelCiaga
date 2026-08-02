const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");


const cart = [];



function renderCart() {

    cartItems.replaceChildren();

    let total = 0;

    cart.forEach(product => {

        total += product.precio;

        const item = document.createElement("div");
        item.className = "cart-item";

        const name = document.createElement("span");
        name.textContent = product.nombre;

        const price = document.createElement("strong");
        price.textContent = `$${product.precio.toLocaleString()}`;

        item.append(name, price);

        cartItems.appendChild(item);

    });

    if (cart.length === 0) {

        const empty = document.createElement("p");
        empty.className = "empty-cart";
        empty.textContent = "Your cart is empty.";

        cartItems.appendChild(empty);

    }

    cartCount.textContent = cart.length;
    cartTotal.textContent = `$${total.toLocaleString()}`;

}

document.querySelectorAll(".add-cart-btn").forEach(button => {

    button.addEventListener("click", () => {

        const id = button.dataset.id;

        const product = cart.find(item => item.id === id);

        if (product) {

            product.cantidad++;

        } else {

            cart.push({

                id,
                nombre: button.dataset.name,
                precio: Number(button.dataset.price),
                imagen: button.dataset.image,
                cantidad: 1

            });

        }

        renderCart();
        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(
            document.getElementById("shoppingCart")
        );

        offcanvas.show();

    });

});

