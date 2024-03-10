// $ npm i passport passport-local passport-local-mongoose
const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true  // 一意になることを保証
    }
});

// userSchameにpassportLocalMongooseの機能が組み込まれる
// ので、username, pw(hash/salt)をこちらで設定しなくても裏でやってくれる
userSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        UserExistsError: 'そのユーザー名はすでに使われています。',
        MissingPasswordError: 'パスワードを入力してください。',
        AttemptTooSoonError: 'アカウントがロックされています。時間をあけて再度試してください。',
        TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました。',
        NoSaltValueStoredError: '認証ができませんでした。',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています。',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています。',
    }
});

module.exports = mongoose.model('User', userSchema);
