document.addEventListener("DOMContentLoaded", () => {

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    const checkoutLink = document.getElementById("checkout-link");

    const cart = JSON.parse(localStorage.getItem("cart")) || [];


    // =========================
    // GUARDAR CARRITO
    // =========================

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }


    // =========================
    // MOSTRAR CARRITO
    // =========================

    function renderCart() {

        cartItems.replaceChildren();

        let total = 0;


        cart.forEach((product, index) => {

            total += product.precio * product.cantidad;


            const item = document.createElement("div");
            item.className = "cart-item";


            // IMAGEN

            const image = document.createElement("img");

            image.src = product.imagen;
            image.alt = product.nombre;
            image.className = "cart-image";


            // INFORMACIÓN

            const info = document.createElement("div");


            const name = document.createElement("span");

            name.textContent = product.nombre;


            const variant = document.createElement("small");

            variant.textContent = `Talla: ${product.talla}`;


            const price = document.createElement("strong");

            price.textContent =
                `$${product.precio.toLocaleString("es-CL")}`;


            const quantity = document.createElement("small");

            quantity.textContent =
                `Cantidad: ${product.cantidad}`;


            // ELIMINAR

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Eliminar";
            deleteButton.className = "remove-cart-btn";


            deleteButton.addEventListener("click", () => {

                cart.splice(index, 1);

                saveCart();

                renderCart();

            });


            info.append(
                name,
                variant,
                price,
                quantity
            );


            item.append(
                image,
                info,
                deleteButton
            );


            cartItems.appendChild(item);

        });


        // CARRITO VACÍO

        if (cart.length === 0) {

            const empty = document.createElement("p");

            empty.className = "empty-cart";

            empty.textContent =
                "Tu carrito está vacío.";

            cartItems.appendChild(empty);

        }


        // TOTAL DE PRODUCTOS

        const totalItems = cart.reduce(
            (total, product) =>
                total + product.cantidad,
            0
        );


        cartCount.textContent = totalItems;


        // TOTAL PRECIO

        cartTotal.textContent =
            `$${total.toLocaleString("es-CL")}`;


        // CHECKOUT

        if (checkoutLink) {

            checkoutLink.style.display =
                cart.length === 0
                    ? "none"
                    : "";

        }

    }


    // =========================
    // AGREGAR DESDE PRODUCT.JS
    // =========================

    window.addEventListener("storage", () => {

        const updatedCart =
            JSON.parse(localStorage.getItem("cart")) || [];

        cart.splice(
            0,
            cart.length,
            ...updatedCart
        );

        renderCart();

    });


    // =========================
    // INICIALIZAR
    // =========================

    renderCart();

});