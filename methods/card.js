// 500 -> PgSQL error
// 201 -> Пользователя не существует

const send_error = (res, message, status_message = 'Empty field', status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_card = (client, req, res) => {
    let likes = 0;
    client.query('SELECT COUNT(*) FROM public.reviews WHERE item_id=$1', [req.query.card_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows[0]) {
            likes = result.rows[0].count;
        } else {
            send_error(res, 'Карточка не существует', "Card not exists", 201);
        }
    })
    client.query('SELECT * FROM public.items WHERE id=$1', [req.query.card_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }

        if (result.rows[0]) {
            let data = {
                card_id: result.rows[0].id,
                desc: result.rows[0].desc,
                cost: result.rows[0].cost,
                image: result.rows[0].image,
                full_desc: result.rows[0].full_description,
                size: result.rows[0].size,
                likes: likes
            };
            res.end(JSON.stringify(data));
        } else {
            send_error(res, 'Карточка не существует', "Card not exists", 201);
        }
    });
};