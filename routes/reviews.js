const express = require('express');
/* 親のapp.jsで定義されたparamsをこのrouterにmerge(使えるように)する
このmergeをやらないと、req.paramsは空の {} になってしまっているので
これによって、親からidがちゃんと渡ってくる */
const router = express.Router({mergeParams: true});
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// review削除された場合のreview削除処理
// campground削除された場合の紐づいていたreview削除処理は、campground.jsの方でやった
// なぜapp.jsでやらずに他ファイルでやったんだろう？
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
