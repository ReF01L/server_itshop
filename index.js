const {Client} = require('pg');
const body_parser = require('body-parser');
const express = require('express');
const {sign_up} = require('./auth/sign_up');
const {sign_in} = require('./auth/sign_in');
const {get_user, update_data} = require('./methods/users');
const {get_cards} = require('./methods/cards');
const {get_card} = require('./methods/card');
const {get_reviews, add_review} = require('./methods/reviews');
const {get_card_likes, like_card} = require('./methods/card_like');
const {get_review_likes, like_review} = require('./methods/review_like');
const {get_basket, delete_item_from_basket, add_item_to_basket} = require('./methods/basket');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'shop',
    password: 'QAZ&WEX@!Kat\'ka@#$',
    port: 5432
});
const PORT = process.env.PORT || 3000;

client.connect();

const app = express();
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));

// Регистрация нового пользователя
app.post('/register/', (req, res) => sign_up(client, req, res)); // V
// Авторизация существующего пользователя
app.post('/login/', (req, res) => sign_in(client, req, res)); // V
// Получение данных о пользователе
app.get('/user/', (req, res) => get_user(client, req, res)); // V
// Изменение данных пользователя
app.put('/update_user/', (req, res) => update_data(client, req, res)); // V
// Получение всех карточек
app.get('/cards/', (req, res) => get_cards(client, req, res));
// Получение данных о карточке по id
app.get('/card/', (req, res) => get_card(client, req, res));
// Получение отзывов о товаре по его id
app.get('/reviews/', (req, res) => get_reviews(client, req, res));
// Получить лайки на карточке
app.get('/c_likes/', (req, res) => get_card_likes(client, req, res));
// Получить лайки на отзыве
app.get('/r_likes/', (req, res) => get_review_likes(client, req, res));
// Поставить лайк на товар
app.post('/like_card/', (req, res) => like_card(client, req, res));
// Поставить лайк на отзыв
app.post('/like_review/', (req, res) => like_review(client, req, res));
// Добавить отзыв
app.post('/add_review/', (req, res) => add_review(client, req, res));
// Получить предметы в корзине по id пользователя
app.get('/basket/', (req, res) => get_basket(client, req, res));
// Удалить предмет из коризны пользователя
app.delete('/delete_item/', (req, res) => delete_item_from_basket(client, req, res));
// Добавить предмет в корзину пользователя
app.post('/add_item/', (req, res) => add_item_to_basket(client, req, res));

app.get('/test/', (req, res) => {
    client.query('SELECT * FROM public.user', (err, result) => {
        res.json(result.rows);
    })
}) // TEST

app.listen(PORT, () => {
    console.log(`Server has been started on ${PORT}...`);
});