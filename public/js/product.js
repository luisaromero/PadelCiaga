document.addEventListener("DOMContentLoaded", () => {

    //get size


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


    // function to quantity

    const quantityValue =
        document.querySelector(".quantity-value");

    const quantityMinus =
        document.querySelector(".quantity-minus");

    const quantityPlus =
        document.querySelector(".quantity-plus");

    let quantity = 1;

    quantityPlus.addEventListener("click", () => {
        quantity++;
        quantityValue.textContent = quantity;
    });

    quantityMinus.addEventListener("click", () => {

        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
        }

    });


    // add to cart


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

        const productElement =
            document.querySelector("[data-product-id]");

        const product = {
            id: productElement.dataset.productId,
            variantId,
            talla,
            nombre:
                productElement.dataset.productName,
            precio:
                Number(productElement.dataset.productPrice),
            imagen:
                productElement.dataset.productImage,
            cantidad: quantity
        };

        const cart =
            JSON.parse(localStorage.getItem("cart")) || [];


        const existingProduct = cart.find(item =>
            item.id === product.id &&
            item.variantId === product.variantId
        );


        if (existingProduct) {

            existingProduct.cantidad += product.cantidad;

        } else {

            cart.push(product);

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        console.log("Producto agregado al carrito:", product);
    });

});