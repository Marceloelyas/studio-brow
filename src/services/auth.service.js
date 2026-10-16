const users = require('../models/users.model');

exports.login = async (email, password) => {
  if (!email || !password) {
    const err = new Error('E-mail e senha obrigatórios');
    err.status = 400;
    throw err;
  }
  const user = await users.findByCredentials(email, password);
  if (!user) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  return user;
};
