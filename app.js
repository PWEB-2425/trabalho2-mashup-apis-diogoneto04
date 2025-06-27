const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_super_secreto',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}));

app.use(passport.initialize());
app.use(passport.session());

const initializePassport = require('./routes/passport');
initializePassport(passport);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB ligado com sucesso!'))
    .catch(err => console.error('❌ Erro na ligação ao MongoDB:', err));

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// Histórico
app.get('/api/history', ensureAuth, (req, res) => {
    res.json({ history: req.user.history });
});

// Pesquisa
app.post('/api/search', ensureAuth, async (req, res) => {
    const termo = req.body.termo;
    if (!termo) return res.json({ error: 'Termo obrigatório.' });

    try {
        const weatherResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${termo}&units=metric&appid=${process.env.WEATHER_API_KEY}&lang=pt`);
        const weather = await weatherResp.json();
        if (weather.cod !== 200) {
            return res.json({ error: 'Cidade não encontrada no OpenWeather.' });
        }

        const wikiResp = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`);
        const summary = await wikiResp.json();

        const image = summary.thumbnail ? summary.thumbnail.source : null;

        req.user.history.push({ term: termo, date: new Date() });
        await req.user.save();

        res.json({ weather, summary, image });
    } catch (err) {
        console.error(err);
        res.json({ error: 'Erro ao obter dados das APIs.' });
    }
});

// Verificar sessão
app.get('/auth/check', (req, res) => {
    res.json({ authenticated: req.isAuthenticated() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
