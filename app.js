const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Middlewares básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Tornar a pasta /public acessível
app.use(express.static('public'));

// Sessões
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_super_secreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Configurar passport
const initializePassport = require('./routes/passport');
initializePassport(passport);

// Importar Rotas
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Ligação ao MongoDB 🔥
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB ligado com sucesso!'))
    .catch((err) => console.error('❌ Erro na ligação ao MongoDB:', err));

// Middleware para garantir autenticação
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// Rotas para páginas
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// API para histórico
app.get('/api/historico', ensureAuth, (req, res) => {
    res.json({ history: req.user.history });
});

// API para pesquisa (Mashup: OpenWeather + Wikipedia)
app.post('/api/search', ensureAuth, async (req, res) => {
    const termo = req.body.termo;
    if (!termo) return res.json({ error: 'Termo obrigatório.' });

    try {
        // OpenWeather API
        const weatherResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${termo}&units=metric&appid=${process.env.WEATHER_API_KEY}&lang=pt`);
        const weather = await weatherResp.json();

        if (weather.cod !== 200) {
            return res.json({ error: 'Cidade não encontrada no OpenWeather.' });
        }

        // Wikipedia API
        const wikiResp = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`);
        const summary = await wikiResp.json();

        // Guardar no histórico do utilizador
        req.user.history.push({ term: termo, date: new Date() });
        await req.user.save();

        res.json({ weather, summary });
    } catch (err) {
        console.error(err);
        res.json({ error: 'Erro ao obter dados das APIs.' });
    }
});

// API para verificar se está autenticado (usado no script.js)
app.get('/auth/check', (req, res) => {
    res.json({ authenticated: req.isAuthenticated() });
});

// Ligar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
