// productinn = 本番環境 (本番環境ではない = 開発環境)
// 本番環境でenvを他人に見られちゃうとまずいので
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDBコネクションok!!!!!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー!!!!!');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// expressに対して、フォームのリクエストをparseさせる
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'mysecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on('error', e => {
    console.log('セッションストアエラー', e);
});

const sessionConfig = {
    store,
    name: 'session',  // cookieで表示される名前
    secret,
    resave: false,  // warning回避用
    saveUninitialized: true,  // warning回避用
    cookie: {
        httpOnly: true,  // jsからcookieの値を覗いての悪さができないようにする
        // secure: true,  // httpではなくhttpsでしかcookieのやり取りをしなくなる
        maxAge: 1000 * 60 * 60 * 24 * 7  // cookieの有効期限(ミリ秒)(よくあるログイン持続期間) - 1週間とする
    }
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));  // LocalStrategy: ログインの方法 / authenticate: 認証の方法
passport.serializeUser(User.serializeUser());  // sessionの中にどうuser情報を詰め込むか
passport.deserializeUser(User.deserializeUser());  // sessionに入ってる情報からどうuserを作るか

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

// res.localsの復習
// あるrequestのライフサイクル内(1回のrequest内)で使える変数を一時的に保存できる
// ということでlocalsに定義したもの(locals.の後の部分)はどのテンプレからも使える
app.use((req, res, next) => {
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/', userRoutes);

// campgrounds系のprefixを設定
// 特に注意の必要無し
app.use('/campgrounds', campgroundsRoutes);

// reviews系のprefixを指定
// idというparameterが必要になってくるので、reviews.jsではこれを明示的にmergeする必要あり
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が起きました';
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中...');
});
