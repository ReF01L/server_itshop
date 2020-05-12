// 500 -> PgSQL error
// 201 -> Пользователя не существует

const send_error = (res, message, status_message = 'Empty field', status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_reviews = (client, req, res) => {
    client.query('SELECT * FROM public.reviews WHERE item_id=$1', [req.query.card_id], (err, result) => {
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

module.exports.add_review = (client, req, res) => {
    client.query('INSERT INTO public.reviews(author, text, item_id)VALUES ($1, $2, $3);', [req.body.author, req.body.text, req.body.item_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows) {
            client.query('SELECT MAX(id) FROM public.reviews', (e, r) => {
                if (e) {
                    send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                    return;
                }
                if (r.rows) {
                    res.end(JSON.stringify(r.rows[0].max));
                }
            })
        } else {
            send_error(res, 'Карточка не существует', "Card not exists", 201);
        }
    })
};