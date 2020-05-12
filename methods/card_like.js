const send_error = (res, message, status_message, status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_card_likes = (client, req, res) => {
    client.query('SELECT * FROM public.items_likes WHERE item_id=$1', [req.query.id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows[0]) {
            res.end(JSON.stringify(result.rows));
        } else {
            send_error(res, 'Карточка не существует', "Card not exists", 201);
        }
    })
};

module.exports.like_card = (client, req, res) => {
    client.query('INSERT INTO public.items_likes(user_id, item_id) VALUES ($1, $2)', [req.body.user_id, req.body.item_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows) {
            res.status(200).send('Success');
        } else {
            send_error(res, 'Пользователя или товара не существует', "User or item not exists", 201);
        }
    })
}