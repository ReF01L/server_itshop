// 500 -> PgSQL error
// 201 -> Пользователя не существует

const {salt_hash_password} = require('../hash');

const send_error = (res, message, status_message = 'Empty field', status_code) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.get_user = (client, req, res) => {
    client.query('SELECT * FROM public.user WHERE id=$1', [req.query.user_id], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }
        if (result.rows[0]) {
            let data = {
                name: result.rows[0].name,
                email: result.rows[0].email
            };
            res.end(JSON.stringify(data));
        } else {
            send_error(res, 'Пользователь не существует', "User not exists", 201);
        }
    });
};


module.exports.update_data = (client, req, res) => {
    if (req.body.type === 'password') {
        let hash_data = salt_hash_password(req.body.password + '');
        client.query(`UPDATE public."user" SET password=$1, salt=$2 WHERE id=$3`, [hash_data.passwordHash, hash_data.salt, req.body.user_id], (err, result) => {
            if (err) {
                send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                return;
            }
            if (result.rowCount) {
                res.status(200).send('Updated');
            } else {
                // TODO: Не обновилсь ни одного поля
                send_error(res, 'Пользователя не существует', "User not exists", 201);
            }
        })
    } else {
        client.query(`UPDATE public."user" SET ${req.body.type}=$1 WHERE id=$2`, [req.body.data, req.body.user_id], (err, result) => {
            if (err) {
                send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                return;
            }
            if (result.rowCount) {
                res.status(200).send('Updated');
            } else {
                // TODO: Не обновилось ни одного поля
                send_error(res, 'Пользователя не существует', "User not exists", 201);
            }
        })
    }
};