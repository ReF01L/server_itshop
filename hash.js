const crypto = require('crypto');

const gen_random_string = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}; // gen random string
const sha512 = (password, salt) => {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value,
    }
}; // encoder

module.exports.salt_hash_password = userPassword => sha512(userPassword, gen_random_string(16));
module.exports.check_hash_password = (password, salt) => sha512(password, salt);