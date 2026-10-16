const path = require('path');
const express = require('express');
const session = require('express-session');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errors');

const app = express();

// -------- Body parsing --------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- Sessão --------
app.use(session({
  secret: process.env.SESSION_SECRET || 'troque-esta-chave',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8, // 8h
  },
}));

// -------- API --------
app.use('/api', routes);

// -------- Frontend estático --------
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// SPA fallback para o site público (apenas rotas não-API)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// -------- Erros --------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
