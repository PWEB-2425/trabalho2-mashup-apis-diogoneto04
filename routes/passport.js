const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

function initialize(passport) {
    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'Utilizador não encontrado' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return done(null, false, { message: 'Password incorreta' });

        return done(null, user);
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
}

module.exports = initialize;
