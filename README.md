# Studio Brow

Site de recepção + painel administrativo para estúdio de design de sobrancelhas.

## Stack

- **Frontend:** HTML5, CSS3, JavaScript (vanilla) + Chart.js
- **Backend:** Node.js + Express + express-session
- **Banco:** PostgreSQL 16
- **Deploy:** Docker + Docker Compose

## Arquitetura

Estrutura **híbrida** (frontend + backend no mesmo projeto, backend em camadas):

```
public/   → arquivos estáticos servidos pelo Express
src/      → backend em camadas (routes → controllers → services → models)
db/       → schema, seed e queries
```

Camadas do backend:

```
routes/       → define endpoints e aplica middlewares
controllers/  → valida entrada/saída HTTP
services/     → regras de negócio
models/       → acesso ao banco (SQL)
middlewares/  → auth, error handler
config/       → conexão com PostgreSQL
```

## Como rodar

### 1) Local (com Node + Postgres instalados)

```bash
cp .env.example .env
# ajuste DATABASE_URL para seu Postgres local

psql -U postgres -d studio_brow -f db/schema.sql
psql -U postgres -d studio_brow -f db/seed.sql

npm install
npm run dev
```

Acesse: http://localhost:3000

### 2) Docker (recomendado)

```bash
docker compose up --build
```

Acesse: http://localhost:3000

**Login seed:**
- E-mail: `admin@studiobrow.com`
- Senha: `admin123`

Para resetar o banco:

```bash
docker compose down -v
docker compose up --build
```

## Rotas da API

### Autenticação
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Dashboard
- `GET /api/dashboard`
- `GET /api/dashboard/agenda-hoje`
- `GET /api/dashboard/faturamento-mensal`
- `GET /api/dashboard/servicos-mais-vendidos`

### Clientes
- `GET    /api/clients?q=`
- `GET    /api/clients/:id`
- `GET    /api/clients/:id/appointments`
- `POST   /api/clients`
- `PUT    /api/clients/:id`
- `DELETE /api/clients/:id`

### Agendamentos
- `GET    /api/appointments?status=`
- `GET    /api/appointments/:id`
- `POST   /api/appointments`
- `PUT    /api/appointments/:id`
- `PATCH  /api/appointments/:id/status`
- `DELETE /api/appointments/:id`

### Serviços
- `GET    /api/services?all=1`
- `GET    /api/services/:id`
- `POST   /api/services`
- `PUT    /api/services/:id`
- `DELETE /api/services/:id`

### Pagamentos
- `GET    /api/payments?limit=20`
- `POST   /api/payments`
- `PUT    /api/payments/:id`
- `DELETE /api/payments/:id`

### Profissionais
- `GET /api/professionals`

### Contato
- `POST  /api/contact-messages`
- `GET   /api/contact-messages`
- `PATCH /api/contact-messages/:id/read`
- `PATCH /api/contact-messages/read-all`

## Estrutura de pastas

```
studio_brow/
├── public/          # frontend
├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── css/
│   │   ├── style.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── api.js
│   │   ├── main.js
│   │   └── dashboard.js
│   └── assets/
│       └── img/
├── src/             # backend em camadas
├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── css/
│   │   ├── style.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── api.js
│   │   ├── main.js
│   │   └── dashboard.js
│   └── assets/
│       └── img/│   ├── config/
│   ├── middlewares/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── app.js
│   └── server.js
├── db/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Segurança

- Sessão com cookie `httpOnly` + `sameSite=lax` + `secure` em produção
- Middleware `requireAuth` em todas as rotas privadas
- Senhas com `crypt` + `gen_salt('bf')` (bcrypt via pgcrypto)
- Validações em camada `services`

## Licença

MIT
