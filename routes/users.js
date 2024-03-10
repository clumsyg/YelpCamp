const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(users.register);

router.route('/login')
    .get(users.renderLogin)
    // これだけで認証できちゃうというpassport魔法
    // passportは、req.body内のusernameとpwを自動的に見て、そのpwをhash化し、それがdbのものと一致するか見てくれる
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

router.get('/logout', users.logout);

module.exports = router;
