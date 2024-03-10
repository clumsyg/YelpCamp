const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password);
        // ユーザー登録完了と同時にログインも完了させる
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash('success', 'Yelp Campへようこそ!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'おかえりなさい!!');
    const redirectUrl = req.session.returnTo || '/campgrounds';  // middleware.jsを参照
    // delete演算子: objectのkeyを消去できる
    // returnToは使い終わったら不要なので削除する
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// req.logoutについてpassportの0.6.0ver以降からはlogoutメソッドはasync関数になっている
// ので動画の通り以下のようにコードを書くとエラー
// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success', 'ログアウトしました');
//     res.redirect('/campgrounds');
// });

module.exports.logout = (req, res) => {
    req.logout(() => {
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });
}

