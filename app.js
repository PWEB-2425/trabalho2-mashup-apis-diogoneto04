const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();

// Importação correta do fetch no Node.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Sessões
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_super_secreto',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

const initializePassport = require('./routes/passport');
initializePassport(passport);

// Rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Ligação MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB ligado!'))
    .catch(err => console.error('❌ Erro MongoDB:', err));

// Middleware autenticação
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// Rotas páginas
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// API histórico
app.get('/api/historico', ensureAuth, (req, res) => {
    res.json({ history: req.user.history });
});

// API mashup
app.post('/api/search', ensureAuth, async (req, res) => {
    const termo = req.body.termo;
    if (!termo) return res.json({ error: 'Termo obrigatório.' });

    try {
        // OpenWeather
        const weatherResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${termo}&units=metric&appid=${process.env.WEATHER_API_KEY}&lang=pt`);
        const weather = await weatherResp.json();

        if (weather.cod !== 200) {
            return res.json({ error: 'Cidade não encontrada no OpenWeather.' });
        }

        // Wikipedia
        const wikiResp = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`);
        const summary = await wikiResp.json();

        // Guardar histórico
        req.user.history.push({ term: termo, date: new Date() });
        await req.user.save();

        res.json({ weather, summary });
    } catch (err) {
        console.error(err);
        res.json({ error: 'Erro ao obter dados das APIs.' });
    }
});

// Verificar autenticação
app.get('/auth/check', (req, res) => {
    res.json({ authenticated: req.isAuthenticated() });
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
