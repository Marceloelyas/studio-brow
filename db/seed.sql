-- Serviços iniciais
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Design de Sobrancelhas', 'Mapeamento e design personalizado', 80.00, 45),
('Henna', 'Preenchimento com henna', 60.00, 30),
('Brow Lamination', 'Laminado de sobrancelhas', 150.00, 60),
('Design + Henna', 'Combo design e henna', 120.00, 60)
ON CONFLICT DO NOTHING;

-- Admin
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@studiobrow.com', crypt('admin123', gen_salt('bf')), 'admin')
ON CONFLICT (email) DO NOTHING;

-- Profissional vinculada ao admin
INSERT INTO professionals (user_id, bio, specialty)
SELECT id, 'Especialista em design de sobrancelhas', 'Design e Lamination'
FROM users WHERE email = 'admin@studiobrow.com'
ON CONFLICT DO NOTHING;
