studio_brow/
├── public/                          # frontend
│   ├── index.html
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
│
├── src/                             # backend em camadas
│   ├── config/
│   │   └── db.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── errors.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── clients.routes.js
│   │   ├── appointments.routes.js
│   │   ├── services.routes.js
│   │   ├── payments.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── professionals.routes.js
│   │   └── contact.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── clients.controller.js
│   │   ├── appointments.controller.js
│   │   ├── services.controller.js
│   │   ├── payments.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── professionals.controller.js
│   │   └── contact.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── clients.service.js
│   │   ├── appointments.service.js
│   │   ├── services.service.js
│   │   ├── payments.service.js
│   │   ├── dashboard.service.js
│   │   └── contact.service.js
│   ├── models/
│   │   ├── users.model.js
│   │   ├── clients.model.js
│   │   ├── appointments.model.js
│   │   ├── services.model.js
│   │   ├── payments.model.js
│   │   ├── professionals.model.js
│   │   └── contact.model.js
│   ├── app.js
│   └── server.js
│
├── db/
│   ├── schema.sql
│   ├── seed.sql
│   └── queries.sql
│
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
