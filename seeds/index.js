const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MongoDBコネクションok!!!!!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー!!!!!');
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 1000;
        const camp = new Campground({
            // author: '65eb311c9583b228b8fb6b58',  // sato - pw忘れた
            author: '65ec39698c708c19180105d5',  // ka
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randomCityIndex].longitude,
                    cities[randomCityIndex].latitude
                ]
            },
            price,  // 「price: price」 の省略表記
            images: [
                {
                    url: 'https://res.cloudinary.com/dz1exv6hm/image/upload/v1710083735/YelpCamp/ho6oyorxyf6rfv6xpiji.jpg',
                    filename: 'YelpCamp/ho6oyorxyf6rfv6xpiji'
                },
                {
                    url: 'https://res.cloudinary.com/dz1exv6hm/image/upload/v1710083800/YelpCamp/a3c6ouhh18c6lpwp7vva.jpg',
                    filename: 'YelpCamp/a3c6ouhh18c6lpwp7vva'
                },
                {
                    url: 'https://res.cloudinary.com/dz1exv6hm/image/upload/v1710083737/YelpCamp/znqhhc9m8b42jafxvuyt.jpg',
                    filename: 'YelpCamp/znqhhc9m8b42jafxvuyt'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();  // これで、毎回node ~~.jsって実行する必要なくなった
});
