const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const userExist = await User.findOne({ username });
    if (userExist) return res.status(400).send('Utilizador já existe');
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('Registado');
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.send('Login feito');
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;
