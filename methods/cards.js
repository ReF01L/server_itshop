// 500 -> PgSQL error
// 201 -> Карточек нет

const send_error = (res, message, status_message = 'Empty field', status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_cards = (client, req, res) => {
    client.query('SELECT * FROM public.items', (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }

        if (result.rows[0]) {
            res.end(JSON.stringify(result.rows));
        } else {
            send_error(res, 'Не создано ни одной карточки', "Cards not exists", 201);
        }
    });
};