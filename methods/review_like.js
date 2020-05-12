const send_error = (res, message, status_message, status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_review_likes = (client, req, res) => {
    client.query('SELECT * FROM public.reviews_likes WHERE review_id=$1', [req.query.id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows[0]) {
            res.end(JSON.stringify(result.rows));
        } else {
            send_error(res, 'Отзыв не существует', "Review not exists", 201);
        }
    })
};

module.exports.like_review = (client, req, res) => {
    client.query('INSERT INTO public.reviews_likes(user_id, review_id) VALUES ($1, $2)', [req.body.user_id, req.body.review_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows) {
            res.status(200).send('Success');
        } else {
            send_error(res, 'Пользователя или отзыва не существует', "User or review not exists", 201);
        }
    })
}