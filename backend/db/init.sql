-- Step 1: Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    expertise_required VARCHAR(255) NOT NULL,
    short_explanation TEXT NOT NULL,
    high_level_idea TEXT,
    project_stage VARCHAR(100) NOT NULL,
    level_of_commitment VARCHAR(100) NOT NULL,
    confidentiality_level VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Meetings Table (NDA handling)
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    requester_id INTEGER REFERENCES users(id),
    owner_id INTEGER REFERENCES users(id),
    message TEXT,
    proposed_times TEXT,
    nda_accepted BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Interest Expressed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA (Runs automatically if empty)
-- Pre-hashed password for all seed users is "password123" ($2a$10$wE9A6836y1XFjP6T9t/8bONN.XqI2q.0Z5l194FDEwX0TXZs.4N7C)
INSERT INTO users (id, email, password_hash, role, name, is_verified) VALUES 
(1, 'admin@hacettepe.edu.tr', '$2a$10$wE9A6836y1XFjP6T9t/8bONN.XqI2q.0Z5l194FDEwX0TXZs.4N7C', 'Admin', 'Admin', true),
(2, 'j.smith@cambridge.ac.uk', '$2a$10$wE9A6836y1XFjP6T9t/8bONN.XqI2q.0Z5l194FDEwX0TXZs.4N7C', 'Engineer', 'JS_Tech', true),
(3, 'm.chen@stanford.edu', '$2a$10$wE9A6836y1XFjP6T9t/8bONN.XqI2q.0Z5l194FDEwX0TXZs.4N7C', 'Healthcare Professional', 'DrChen', true),
(4, 't.becker@tum.edu', '$2a$10$wE9A6836y1XFjP6T9t/8bONN.XqI2q.0Z5l194FDEwX0TXZs.4N7C', 'Engineer', 'TheoDev', true)
ON CONFLICT (email) DO NOTHING;

-- Since we hardcoded IDs, we must advance the sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- SEED POSTS
INSERT INTO posts (id, user_id, title, domain, expertise_required, short_explanation, high_level_idea, project_stage, level_of_commitment, confidentiality_level, country, city, status)
SELECT 1, 2, 'AI-driven MRI Analysis Tool', 'Cardiology Imaging', 'Cardiologist/Radiologist', 'Developing a machine learning model to detect early-stage cardiac anomalies from MRI scans.', 'Needs a clinical partner to provide anonymized datasets and clinical validation.', 'Prototype Developed', 'Part-time (5-10 hours/week)', 'Open - General information sharing', 'Germany', 'Munich', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id = 1);

INSERT INTO posts (id, user_id, title, domain, expertise_required, short_explanation, high_level_idea, project_stage, level_of_commitment, confidentiality_level, country, city, status)
SELECT 2, 3, 'Smart Insulin Pen Tracker App', 'Endocrinology', 'Mobile App Developer (React Native/Flutter)', 'Looking for an engineer to build a mobile app that syncs with smart insulin pens via Bluetooth.', 'The app needs a very clean UI for elderly patients.', 'Idea/Concept', 'Full-time / Co-founder required', 'Confidential - Meeting Required', 'UK', 'London', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id = 2);

INSERT INTO posts (id, user_id, title, domain, expertise_required, short_explanation, high_level_idea, project_stage, level_of_commitment, confidentiality_level, country, city, status)
SELECT 3, 2, 'Robotic Surgery Haptic Feedback Sleeve', 'Surgery', 'Surgical Robot Integrator', 'We built a prototype sensor sleeve that gives haptic feedback to surgeons during robotic ops.', 'Need a clinical partner to test the prototype in simulated environments.', 'Concept Validation', 'Part-time (5-10 hours/week)', 'Confidential - NDA Required', 'USA', 'Palo Alto', 'Meeting Scheduled'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE id = 3);

SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
