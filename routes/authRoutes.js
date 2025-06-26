const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

// Página de registo (opcional se fizeres frontend separado)
router.get('/register', (req, res) => {
    res.send('<form action="/auth/register" method="POST">Username: <input name="username"/><br>Password: <input type="password" name="password"/><br><button>Registar</button></form>');
});

// Processo de registo
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExistente = await User.findOne({ username });
        if (userExistente) {
            return res.send('Utilizador já existe!');
        }

        const novoUser = new User({ username, password });
        await novoUser.save();
        res.send('Registo feito com sucesso! <a href="/auth/login">Fazer login</a>');
    } catch (err) {
        console.log(err);
        res.send('Erro no registo');
    }
});

// Página de login (opcional se fizeres frontend separado)
router.get('/login', (req, res) => {
    res.send('<form action="/auth/login" method="POST">Username: <input name="username"/><br>Password: <input type="password" name="password"/><br><button>Login</button></form>');
});

// Processo de login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login'
}));

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;
