// ==========================================
// 1. IMPORTS
// ==========================================
require('dotenv').config();

const express = require('express');
const path = require('path');
const products = require('./products');

const { engine } = require('express-handlebars');
const pool = require("./config/db");

const app = express();

// ==========================================
// 2. MIDDLEWARES GLOBALES
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 3. CONFIGURACIÓN DEL MOTOR DE VISTAS
// ==========================================
app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        upperCase: function (text) {
            if (!text) return '';
            return text.toUpperCase();
        },
        formatCLP: function (price) {
            return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
            }).format(price);
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ==========================================
// 4. DATOS (mock, en memoria)
// ==========================================

const name_brand = 'Padel Ciaga'

const welcomeMsg = 'Bienvenida a nuestra tienda'


// ==========================================
// 5. RUTAS
// ==========================================
app.route('/')
    .get((req, res) => {
        res.render("home", {
            brand: name_brand,
            products: products,
            msg_welcome: welcomeMsg
        });
    })
    .all((req, res) => {
        res.status(405).send("Método no permitido");
    });

app.route('/about')
    .get((req, res) => {
        res.render("about", {
        });
    })
    .all((req, res) => {
        res.status(405).send("Método no permitido");
    });

app.route('/contact')
    .get((req, res) => {
        res.render("contact", {
            titulo: "Contáctanos"
        });
    })
    .post((req, res) => {
        const { nombre, email, mensaje } = req.body;

        console.log("Nuevo mensaje de contacto:", { nombre, email, mensaje });

        res.render("success", {
            nombre: nombre
        });
    })
    .all((req, res) => {
        res.status(405).send("Método no permitido");
    });

app.route('/cart')
    .get((req, res) => {
        res.render("cart", {
            cartPage: true
        });
    })
    .all((req, res) => {
        res.status(405).send("Método no permitido");
    });

app.route('/checkout')

    .get((req, res) => {

        res.render("checkout");

    })

    .all((req, res) => {

        res.status(405).send("Método no permitido");

    });

// PRUEBA POSTGRESQL
app.get("/users", async (req, res) => {

    try {

        const result = await pool.query("SELECT * FROM users");

        res.json(result.rows);

    } catch (error) {

        console.error("Error obteniendo usuarios:", error);

        res.status(500).send("Error al obtener usuarios");

    }

});

app.route('/register')
    .get((req, res) => {
        res.render("register");
    })
    .post(async (req, res) => {

        const { nombre, email, password } = req.body;

        console.log({
            nombre,
            email,
            password
        });

        res.send("Registro recibido");
    })
    .all((req, res) => {
        res.status(405).send("Método no permitido");
    });
// ==========================================
// 6. MANEJO DE ERRORES (siempre al final)
// ==========================================

// 404 - Ruta que no existe
app.use((req, res) => {
    res.status(404).render("404", {
        titulo: "Página no encontrada"
    });
});

// 500 - Error inesperado del servidor
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", {
        titulo: "Error del servidor",
        mensaje: "Algo salió mal. Intenta de nuevo más tarde."
    });
});


// ==========================================
// 7. ARRANQUE DEL SERVIDOR
// ==========================================

pool.query("SELECT NOW()")
    .then(result => {
        console.log("✅ PostgreSQL conectado");
        console.log("Hora de PostgreSQL:", result.rows[0].now);
    })
    .catch(error => {
        console.error("❌ Error conectando a PostgreSQL:", error.message);
    });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});