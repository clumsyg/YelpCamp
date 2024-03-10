const mongoose = require('mongoose');
const Review = require('./review');
const { string } = require('joi');
const { Schema } = mongoose;

// https://res.cloudinary.com/dwwvtzk17/image/upload/w_200/v1632870878/YelpCamp/tv1qjswm7s9ke29mxnsj.jpg

const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

/* review削除された場合のreview削除処理はapp.jsでやったので、
campground削除された場合の紐づいていたreview削除処理もここでやる。
app.jsの、app.delete('/campgrounds/:id',   のところではfindByIdAndDeleteされてるが、
findByIdAndDeleteで実際にtrigger(実行)されるミドルウェアはfindOneAndDelete(復習)。
以下の式の意味は、findOneAndDeleteが呼ばれた時にコールバック関数が実行される。
preではなくpostを使っていることで、function()の括弧内の引数には、削除対象となったdocument(object)が来る */
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);
