const send_error = (res, message, status_message, status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_basket = (client, req, res) => {
    client.query('SELECT * FROM public.basket WHERE user_id=$1', [req.query.user_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows[0]) {
            let data = {
                item_id: [],
                count: [],
            };
            let i = 0;
            while (result.rows[i]) {
                data.item_id.push(result.rows[i].item_id);
                data.count.push(result.rows[i].count)
                i++;
            }
            res.end(JSON.stringify(data));
        } else {
            send_error(res, 'Пользователь не существует или коризна пустая', "User or basket not exists", 201);
        }
    })
};

module.exports.delete_item_from_basket = (client, req, res) => {
    client.query('DELETE FROM public.basket WHERE user_id=$1 AND item_id=$2', [req.query.user_id, req.query.item_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rowCount) {
            res.status(200).send('Deleted');
        } else {
            send_error(res, 'Пользователя не существует или предмета нет в корзине', "User not exists", 201);
        }
    })
}

module.exports.add_item_to_basket = (client, req, res) => {
    client.query('SELECT * FROM public.basket WHERE user_id=$1 AND item_id=$2', [req.body.user_id, req.body.item_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows[0]) {
            client.query('UPDATE public.basket SET count=$1 WHERE user_id=$2 AND item_id=$3', [req.body.count, req.body.user_id, req.body.item_id], (e, r) => {
                if (err) {
                    send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                    return;
                }
                if (r.rowCount) {
                    res.status(200).send('Updated');
                } else {
                    send_error(res, 'Предмета не существует', "Item not exists", 201);
                }
            })
        } else {
            client.query('INSERT INTO public.basket(user_id, item_id, count) VALUES ($1, $2, $3);', [req.body.user_id, req.body.item_id, req.body.count], (err, result) => {
                if (err) {
                    send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                    return;
                }
                if (result.rows) {
                    res.status(200).send('Inserted');
                } else {
                    send_error(res, 'Пользователя не существует или предмета нет в корзине', "User not exists", 201);
                }
            })
        }
    })
}