/* =========================================================
   Wrapper de fetch para a API do Studio Brow
   ========================================================= */
(function (global) {
  const API_BASE = '/api';

  async function request(path, options = {}) {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(`${API_BASE}${path}`, config);

    if (res.status === 401 && !path.startsWith('/auth/')) {
      // Sessão expirada → volta para login
      window.location.href = '/login.html';
      throw new Error('Não autenticado');
    }

    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) msg = body.error;
      } catch (_) {}
      throw new Error(msg);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  global.API = {
    get:    (path)        => request(path, { method: 'GET' }),
    post:   (path, body)  => request(path, { method: 'POST',   body }),
    put:    (path, body)  => request(path, { method: 'PUT',    body }),
    patch:  (path, body)  => request(path, { method: 'PATCH',  body }),
    delete: (path)        => request(path, { method: 'DELETE' }),
  };

  // Atalho retrocompatível com o código anterior
  global.api = global.API.get;
})(window);
