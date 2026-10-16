-- Criação  do banco:
-- CREATE DATABASE studio_brow;
-- \ studio_brow

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE appointment_status AS ENUM ('agendado','confirmado','concluido','cancelado','faltou');
CREATE TYPE payment_method AS ENUM ('dinheiro','pix','credito','debito','transferencia');
CREATE TYPE payment_status AS ENUM ('pendente','pago','estornado');

-- USUÁRIOS DO SISTEMA
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'profissional' CHECK (role IN ('admin','profissional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROFISSIONAIS
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  bio TEXT,
  specialty VARCHAR(120),
  active BOOLEAN NOT NULL DEFAULT true
);

-- CLIENTES
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160),
  phone VARCHAR(20) NOT NULL,
  birth_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SERVIÇOS
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  active BOOLEAN NOT NULL DEFAULT true
);

-- AGENDAMENTOS
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'agendado',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PAGAMENTOS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pendente',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PORTFÓLIO
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(120) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MENSAGENS DE CONTATO
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(120),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ÍNDICES
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- VIEWS PARA DASHBOARD
CREATE VIEW vw_agenda_hoje AS
SELECT
  a.id,
  a.scheduled_at,
  c.name AS cliente,
  c.phone,
  s.name AS servico,
  u.name AS profissional,
  a.status
FROM appointments a
JOIN clients c ON c.id = a.client_id
JOIN services s ON s.id = a.service_id
LEFT JOIN professionals p ON p.id = a.professional_id
LEFT JOIN users u ON u.id = p.user_id
WHERE a.scheduled_at::date = CURRENT_DATE
ORDER BY a.scheduled_at;

CREATE VIEW vw_faturamento_mensal AS
SELECT
  date_trunc('month', paid_at) AS mes,
  SUM(amount) AS total
FROM payments
WHERE status = 'pago'
GROUP BY 1
ORDER BY 1 DESC;

CREATE VIEW vw_servicos_mais_vendidos AS
SELECT
  s.name,
  COUNT(*) AS total
FROM appointments a
JOIN services s ON s.id = a.service_id
WHERE a.status = 'concluido'
GROUP BY s.name
ORDER BY total DESC;

CREATE VIEW vw_dashboard_resumo AS
SELECT
  (SELECT COUNT(*) FROM appointments WHERE scheduled_at::date = CURRENT_DATE) AS agendamentos_hoje,
  (SELECT COUNT(*) FROM appointments WHERE status = 'agendado') AS agendamentos_pendentes,
  (SELECT COALESCE(SUM(amount),0) FROM payments
   WHERE status = 'pago'
     AND date_trunc('month', paid_at) = date_trunc('month', CURRENT_DATE)) AS faturamento_mes,
  (SELECT COUNT(*) FROM clients) AS total_clientes;

-- SEED INICIAL
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Design de Sobrancelhas', 'Mapeamento e design personalizado', 80.00, 45),
('Henna', 'Preenchimento com henna', 60.00, 30),
('Brow Lamination', 'Laminado de sobrancelhas', 150.00, 60),
('Design + Henna', 'Combo design e henna', 120.00, 60);

INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@studiobrow.com', crypt('admin123', gen_salt('bf')), 'admin');

INSERT INTO professionals (user_id, bio, specialty)
SELECT id, 'Especialista em design de sobrancelhas', 'Design e Lamination'
FROM users WHERE email = 'admin@studiobrow.com';
