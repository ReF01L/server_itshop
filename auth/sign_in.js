const {check_hash_password} = require('../hash');

// 500 -> PgSQL error
// 501 -> Некорректный ввод
// 202 -> Пустое поле
// 201 -> Пользователь уже существует, неверный пароль, пользователя не существует

const send_error = (res, message, status_message = 'Empty field', status_code = 202) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.sign_in = (client, req, res) => {
    if (!req.body.email) {
        send_error(res, 'Поле email не может быть пустым');
        return
    }
    if (!req.body.password) {
        send_error(res, 'Поле Пароль не может быть пустым');
        return
    }

    let user_password = req.body.password;
    let email = req.body.email;

    client.query('SELECT * FROM public.user WHERE email=$1', [email], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
            return;
        }

        if (result.rows[0]) {
            let salt = result.rows[0].salt;
            let pass = result.rows[0].password;
            let hashed_password = check_hash_password(user_password.toString(), salt).passwordHash;
            if (pass === hashed_password)
            {
                let data = {
                    token: result.rows[0].token,
                    user_id: result.rows[0].id
                };
                res.end(JSON.stringify(data));
            }
            else
                send_error(res, 'Неверный пароль', "Wrong password", 201);
        } else
            send_error(res, 'Пользователь не существует', "User not exists", 201);
    });
};