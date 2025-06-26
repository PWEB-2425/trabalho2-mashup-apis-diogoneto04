const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const User = require('../models/User');

// Middleware para proteger rotas
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Não autorizado' });
}

// Endpoint para pesquisa
router.post('/search', ensureAuth, async (req, res) => {
    const termo = req.body.termo;

    try {
        // Grava no histórico
        req.user.history.push({ term: termo, date: new Date() });
        await req.user.save();

        // APIs
        const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(termo)}&appid=${process.env.WEATHER_KEY}&units=metric&lang=pt`;
        const wikiAPI = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`;

        // Fetch
        const [weatherRes, wikiRes] = await Promise.all([
            fetch(weatherAPI),
            fetch(wikiAPI)
        ]);

        const weatherData = await weatherRes.json();
        const wikiData = await wikiRes.json();

        // Se erro na weather API
        if (weatherData.cod !== 200) {
            return res.json({ error: `Erro na Weather API: ${weatherData.message}` });
        }

        res.json({
            weather: weatherData,
            summary: wikiData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao obter dados das APIs.' });
    }
});

// Endpoint para histórico
router.get('/history', ensureAuth, async (req, res) => {
    res.json({ history: req.user.history });
});

module.exports = router;
