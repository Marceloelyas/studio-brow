require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('[db] conectado com sucesso');

    app.listen(PORT, () => {
      console.log(`[app] rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[db] falha ao conectar', err);
    process.exit(1);
  }
})();
