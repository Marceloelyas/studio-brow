function notFound(req, res, next) {
  res.status(404).json({ error: 'Recurso não encontrado' });
}

function errorHandler(err, req, res, next) {
  console.error('[erro]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
}

module.exports = { notFound, errorHandler };
