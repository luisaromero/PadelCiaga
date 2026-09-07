// ==========================================
// 1. IMPORTS
// ==========================================
require('dotenv').config();

const express = require('express');
const path = require('path');
const products = require('./products');

const { engine } = require('express-handlebars');
const pool = require("./config/db");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    }
}));

app.use((req, res, next) => {
    console.log("SESSION ACTUAL:", req.session);

    if (req.session.userId) {

        res.locals.user = {
            id: req.session.userId,
            nombre: req.session.userName
        };

    } else {

        res.locals.user = null;

    }

    next();

});

const requireAuth = (req, res, next) => {

    if (!req.session.userId) {

        req.session.returnTo = req.originalUrl;

        return res.redirect("/login");
    }

    next();
};

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

    .get(requireAuth, async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT id, nombre, apellido, email, telefono, direccion
                 FROM users
                 WHERE id = $1`,
                [req.session.userId]
            );

            const user = result.rows[0];

            if (!user) {
                return res.redirect("/login");
            }

            res.render("checkout", {
                checkoutPage: true,
                user
            });

        } catch (error) {

            console.error("Error obteniendo datos del usuario:", error);

            res.status(500).send("No pudimos cargar el checkout.");

        }

    })

    .all((req, res) => {

        res.status(405).send("Método no permitido");

    });


app.post("/orders", async (req, res) => {

    const client = await pool.connect();

    try {

        const { customer, products } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({
                error: "El carrito está vacío."
            });
        }

        await client.query("BEGIN");

        // Calculamos el total en el backend
        const total = products.reduce((sum, product) => {
            return sum + (product.precio * product.cantidad);
        }, 0);

        // Creamos la orden
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total)
             VALUES ($1, $2)
             RETURNING id`,
            [req.session.userId, total]
        );

        const orderId = orderResult.rows[0].id;

        // Guardamos cada producto de la orden
        for (const product of products) {

            await client.query(
                `INSERT INTO order_items
                 (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [
                    orderId,
                    product.id,
                    product.cantidad,
                    product.precio
                ]
            );

        }

        await client.query("COMMIT");

        res.json({
            message: "Pedido creado correctamente",
            orderId
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Error creando pedido:", error);

        res.status(500).json({
            error: "No pudimos crear el pedido."
        });

    } finally {

        client.release();

    }
});

app.route('/register')

    .get((req, res) => {

        res.render("register");

    })

    .post(async (req, res) => {

        const { nombre, apellido, email, password } = req.body;

        try {

            const hashedPassword = await bcrypt.hash(password, 10);

            await pool.query(
                `INSERT INTO users (nombre, apellido, email, password)
                    VALUES ($1, $2, $3, $4)`,
                [nombre, apellido, email, hashedPassword]
            );

            res.redirect("/login?success=Cuenta creada correctamente. Ahora puedes iniciar sesión.");

        } catch (error) {

            console.error("Error registrando usuario:", error);

            if (error.code === "23505") {

                return res.status(400).render("register", {
                    error: "Este email ya está registrado.",
                    nombre: nombre,
                    email: email
                });


            }

            res.status(500).render("register", {
                error: "No pudimos crear tu cuenta. Inténtalo nuevamente."
            });

        }

    })

    .all((req, res) => {

        res.status(405).send("Método no permitido");

    });

app.route('/login')

    .get((req, res) => {

        res.render("login", {
            success: req.query.success
        });

    })

    .post(async (req, res) => {

        const { email, password } = req.body;

        try {

            const result = await pool.query(
                `SELECT * FROM users
                 WHERE email = $1`,
                [email]
            );

            const user = result.rows[0];

            if (!user) {

                return res.status(400).render("login", {
                    error: "El email o la contraseña no son correctos.",
                    email
                });

            }

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {

                return res.status(400).render("login", {
                    error: "El email o la contraseña no son correctos.",
                    email
                });

            }
            req.session.userId = user.id;
            req.session.userName = user.nombre;

            const returnTo = req.session.returnTo || "/";

            delete req.session.returnTo;

            res.redirect(returnTo);


        } catch (error) {

            console.error("Error iniciando sesión:", error);

            res.status(500).render("login", {
                error: "No pudimos iniciar sesión. Inténtalo nuevamente.",
                email
            });

        }

    })

    .all((req, res) => {

        res.status(405).send("Método no permitido");

    });

app.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error("Error cerrando sesión:", error);

            return res.status(500).send("No se pudo cerrar la sesión.");

        }

        res.redirect("/");

    });

});

app.route('/profile')

    .get(requireAuth, async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT id, nombre, apellido, email, telefono, direccion
                      FROM users
                      WHERE id = $1`,
                [req.session.userId]
            );

            const user = result.rows[0];

            if (!user) {

                return res.redirect("/login");

            }

            res.render("profile", {
                user
            });

        } catch (error) {

            console.error("Error obteniendo perfil:", error);

            res.status(500).send("No pudimos cargar tu perfil.");

        }

    })
    .post(requireAuth, async (req, res) => {

        const {
            nombre,
            apellido,
            email,
            telefono,
            direccion
        } = req.body;

        try {

            await pool.query(
                `UPDATE users
             SET nombre = $1,
                 apellido = $2,
                 email = $3,
                 telefono = $4,
                 direccion = $5
             WHERE id = $6`,
                [
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    req.session.userId
                ]
            );

            req.session.userName = nombre;

            res.redirect("/profile");

        } catch (error) {

            console.error("Error actualizando perfil:", error);

            if (error.code === "23505") {

                return res.status(400).render("profile", {
                    error: "Este email ya está registrado."
                });

            }

            res.status(500).render("profile", {
                error: "No pudimos actualizar tu perfil."
            });

        }
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