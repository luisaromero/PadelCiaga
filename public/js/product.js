document.addEventListener("DOMContentLoaded", () => {

    const variantButtons =
        document.querySelectorAll("[data-variant-id]");

    variantButtons.forEach(button => {

        button.addEventListener("click", () => {

            variantButtons.forEach(option => {
                option.classList.remove("selected");
            });

            button.classList.add("selected");

            const variantId = button.dataset.variantId;
            const talla = button.textContent.trim();

            console.log("Variant ID:", variantId);
            console.log("Talla:", talla);

        });

    });


    const addProductButton =
        document.querySelector(".add-product-btn");

    addProductButton.addEventListener("click", () => {

        const selectedVariant =
            document.querySelector("[data-variant-id].selected");

        if (!selectedVariant) {

            console.log("Debes seleccionar una talla.");

            return;
        }

        const variantId =
            selectedVariant.dataset.variantId;

        const talla =
            selectedVariant.textContent.trim();

        const productId =
            document.querySelector("[data-product-id]").dataset.productId;

        const product = {
            id: productId,
            variantId,
            talla,
            nombre: document.querySelector("[data-product-name]").dataset.productName,
            precio: Number(
                document.querySelector("[data-product-price]").dataset.productPrice
            ),
            imagen: document.querySelector("[data-product-image]").dataset.productImage,
            cantidad: 1
        };

        console.log("Producto para carrito:", product);

    });

});