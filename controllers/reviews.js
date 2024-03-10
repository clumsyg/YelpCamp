const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'レビューを登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    // campgroundsのreviewsから対象reviewのidを削除。mongodbの$pull演算子を使う
    /* なぜdeleteじゃなくてupdateと$pullをわざわざ使う？ ...gptに聞こう
    | 特定の条件でドキュメント全体を削除するのではなく、
    | ドキュメント内の特定の配列フィールド（reviews）から要素を削除する必要があります。
    あーなるほど。deleteにしちゃうと対象reviewIdを持ってるcampgroundごと消えちゃうからだ。
    campgroundの中のreviewsの中の1つのreviewIdだけを消したいからだ */
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // 対象reviewの削除(これはシンプルで簡単)
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'レビューを削除しました');
    res.redirect(`/campgrounds/${id}`);
}

