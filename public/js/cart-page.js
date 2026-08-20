const cartPageItems = document.getElementById("cart-page-items");
const cartPageTotal = document.getElementById("cart-page-total");
const cartPageFinalTotal = document.getElementById("cart-page-final-total");

const cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCartPage() {

    cartPageItems.replaceChildren();

    let total = 0;

    cart.forEach((product, index) => {

        total += product.precio * product.cantidad;

        const item = document.createElement("div");
        item.className = "cart-page-item";

        // IMAGEN
        const image = document.createElement("img");

        image.src = product.imagen;
        image.alt = product.nombre;
        image.className = "cart-page-image";

        // INFO
        const info = document.createElement("div");
        info.className = "cart-page-info";

        const name = document.createElement("h3");
        name.textContent = product.nombre;

        const price = document.createElement("p");
        price.textContent =
            `$${product.precio.toLocaleString("es-CL")}`;

        // CONTROLES DE CANTIDAD
        const quantityControls = document.createElement("div");
        quantityControls.className = "quantity-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.textContent = "−";
        decreaseButton.className = "quantity-btn";

        const quantity = document.createElement("span");
        quantity.textContent = product.cantidad;
        quantity.className = "quantity-value";

        const increaseButton = document.createElement("button");
        increaseButton.textContent = "+";
        increaseButton.className = "quantity-btn";

        // DISMINUIR
        decreaseButton.addEventListener("click", () => {

            if (product.cantidad > 1) {

                product.cantidad--;

            } else {

                cart.splice(index, 1);

            }

            saveCart();
            renderCartPage();

        });

        // AUMENTAR
        increaseButton.addEventListener("click", () => {

            product.cantidad++;

            saveCart();
            renderCartPage();

        });

        quantityControls.append(
            decreaseButton,
            quantity,
            increaseButton
        );

        // ELIMINAR
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Eliminar";
        deleteButton.className = "remove-cart-btn";

        deleteButton.addEventListener("click", () => {

            cart.splice(index, 1);

            saveCart();
            renderCartPage();

        });

        info.append(
            name,
            price,
            quantityControls,
            deleteButton
        );

        item.append(
            image,
            info
        );

        cartPageItems.appendChild(item);

    });

    if (cart.length === 0) {

        const empty = document.createElement("p");

        empty.className = "empty-cart-page";
        empty.textContent = "Tu carrito está vacío.";

        cartPageItems.appendChild(empty);

    }

    const formattedTotal =
        `$${total.toLocaleString("es-CL")}`;

    cartPageTotal.textContent = formattedTotal;
    cartPageFinalTotal.textContent = formattedTotal;

}

renderCartPage();