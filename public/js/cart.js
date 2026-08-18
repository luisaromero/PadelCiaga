const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

const cart = [];

function renderCart() {

    cartItems.replaceChildren();

    let total = 0;

    cart.forEach((product, index) => {

        total += product.precio * product.cantidad;

        const item = document.createElement("div");
        item.className = "cart-item";

        const image = document.createElement("img");

        image.src = product.imagen;
        image.alt = product.nombre;
        image.className = "cart-image";

        const info = document.createElement("div");

        const name = document.createElement("span");
        name.textContent = product.nombre;

        const price = document.createElement("strong");
        price.textContent = `$${product.precio.toLocaleString("es-CL")}`;

        const quantity = document.createElement("small");
        quantity.textContent = `Cantidad: ${product.cantidad}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.className = "remove-cart-btn";

        deleteButton.addEventListener("click", () => {

            cart.splice(index, 1);

            renderCart();

        });

        info.append(name, price, quantity);

        item.append(image, info, deleteButton);

        cartItems.appendChild(item);

    });

    if (cart.length === 0) {

        const empty = document.createElement("p");
        empty.className = "empty-cart";
        empty.textContent = "Tu carrito está vacío.";

        cartItems.appendChild(empty);

    }

    cartCount.textContent = cart.reduce(
        (total, product) => total + product.cantidad,
        0
    );

    cartTotal.textContent = `$${total.toLocaleString("es-CL")}`;

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