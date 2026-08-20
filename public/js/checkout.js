const checkoutItems = document.getElementById("checkout-items");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");

const cart = JSON.parse(localStorage.getItem("cart")) || [];

function formatPrice(price) {
    return `$${price.toLocaleString("es-CL")}`;
}


function renderCheckout() {

    checkoutItems.replaceChildren();

    let total = 0;
    if (cart.length === 0) {

        const empty = document.createElement("p");

        empty.className = "empty-cart";
        empty.textContent = "Tu carrito está vacío.";

        checkoutItems.appendChild(empty);

        checkoutSubtotal.textContent = "$0";
        checkoutTotal.textContent = "$0";

        return;
    }

    cart.forEach(product => {

        const subtotal = product.precio * product.cantidad;

        total += subtotal;


        const item = document.createElement("div");
        item.className = "checkout-item";


        const info = document.createElement("div");
        info.className = "checkout-item-info";


        const name = document.createElement("span");
        name.className = "checkout-item-name";
        name.textContent = product.nombre;


        const quantity = document.createElement("span");
        quantity.className = "checkout-item-quantity";
        quantity.textContent = `Cantidad: ${product.cantidad}`;


        const price = document.createElement("strong");
        price.className = "checkout-item-price";
        price.textContent = formatPrice(subtotal);


        info.append(name, quantity);

        item.append(info, price);

        checkoutItems.appendChild(item);

    });


    checkoutSubtotal.textContent = formatPrice(total);

    checkoutTotal.textContent = formatPrice(total);

}

if (checkoutForm) {
    if (cart.length === 0) {
        return;
    }

    checkoutForm.addEventListener("submit", event => {

        event.preventDefault();

        const formData = new FormData(checkoutForm);

        const customer = {
            nombre: formData.get("nombre"),
            apellido: formData.get("apellido"),
            email: formData.get("email"),
            telefono: formData.get("telefono"),
            region: formData.get("region"),
            comuna: formData.get("comuna"),
            direccion: formData.get("direccion"),
            numero: formData.get("numero"),
            departamento: formData.get("departamento")
        };

        console.log("Datos del cliente:", customer);
        console.log("Productos:", cart);

    });

}

renderCheckout()

