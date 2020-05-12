const {salt_hash_password} = require('../hash');
const uuid = require('uuid');
const email_validator = require('email-validator');

// 500 -> PgSQL error
// 201 -> Некорректный ввод
// 202 -> Пустое поле
// 201 -> Пользователь уже существует, неверный пароль, пользователя не существует

const unique_id_index = 2;

const email_verifier = email => email_validator.validate(email);

const send_error = (res, message, status_message = 'Empty field', status_code = 202) => {
    res.statusMessage = status_message;
    res.status(status_code).send(message);
};

module.exports.sign_up = (client, req, res) => {
    if (!req.body.name) {
        send_error(res, 'Поле Имя не может быть пустым');
        return
    }
    if (!req.body.email) {
        send_error(res, 'Поле email не может быть пустым');
        return
    }
    if (!req.body.password) {
        send_error(res, 'Поле Пароль не может быть пустым');
        return
    }
    if (req.body.password !== req.body.repeat_password) {
        send_error(res, 'Пароли должны совпадать!');
        return
    }
    if (!email_verifier(req.body.email)) {
        send_error(res, 'Введите корректный email', 'Incorrect e-mail', 201);
        return
    }

    let hash_data = salt_hash_password(req.body.password);

    let new_user = [
        req.body.email,
        req.body.name,
        uuid.v4(),
        hash_data.passwordHash,
        hash_data.salt,
    ];

    client.query('SELECT * FROM public.user WHERE email=$1', [new_user[0]], (err, result) => {
        if (err) {
            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', err.status || 500);
            return;
        }
        if (result.rows[0]) {
            res.status(201).json(`Пользователь с таким email уже существует`);
            return;
        } else {
            client.query('INSERT INTO public.user(email, name, token, password, salt) VALUES ($1, $2, $3, $4, $5)',
                new_user, (err) => {
                    if (err) {
                        send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                        return
                    }
                    let data = {};
                    client.query('SELECT MAX(id) FROM public.user', (err, r) => {
                        if (err) {
                            send_error(res, JSON.stringify(err.stack), 'PgSQL ERROR', 500);
                            return;
                        }
                        if (r.rows[0]) {
                            data = {
                                token: new_user[unique_id_index],
                                user_id: r.rows[0].max
                            };
                            res.end(JSON.stringify(data));
                        }
                    });
                });
        }
    });
};
