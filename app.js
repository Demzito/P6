const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize'); // package pour prevenir des attaques par injection
const helmet = require("helmet"); // package pour les headers

const app = express();

require('dotenv').config();
const user = process.env.DB_USER;
const pass = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const name = process.env.DB_NAME;
// mongoose connect
mongoose.connect(`mongodb+srv://${user}:${pass}@${host}/${name}?retryWrites=true&w=majority`,
    { useNewUrlParser: true,
     useUnifiedTopology: true 
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// CORS - partage de ressources entre serveurs
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use(bodyParser.json()); //bodyparser

app.use(mongoSanitize()); // mongo-sanitize to prevent operator injection
app.use(helmet()); // helmet

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app; // export de l'appli