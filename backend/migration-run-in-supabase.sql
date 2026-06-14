-- STEP 1: Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  recording_id UUID,
  summary TEXT,
  ai_summary JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'customer')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  connection_quality VARCHAR(50) DEFAULT 'fair' CHECK (connection_quality IN ('good', 'fair', 'poor')),
  device_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'file')) DEFAULT 'text',
  metadata JSONB,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('recording', 'processing', 'ready', 'error')),
  duration INTEGER,
  size BIGINT,
  url TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session notes table
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session tags table
CREATE TABLE IF NOT EXISTS session_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL CHECK (tag IN ('installation', 'warranty', 'repair', 'troubleshooting', 'complaint', 'other')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invite tokens table
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(50) UNIQUE NOT NULL,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_participants_session_id ON participants(session_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_files_session_id ON files(session_id);
CREATE INDEX idx_recordings_session_id ON recordings(session_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);

-- Row Level Security (RLS) - Disabled
-- Authorization is handled at the application layer via Express middleware
-- since we're using JWT authentication, not Supabase Auth
-- Enable if using Supabase Auth with auth.uid()

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE session_tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- STEP 2: Seed Data
-- AtomAssist demo seed data
-- Run after backend/database.sql.
-- Demo passwords:
--   agent@atomberg.com    / agent123
--   customer@atomberg.com / customer123
--   admin@atomberg.com    / admin123

DELETE FROM analytics_events;
DELETE FROM system_metrics;
DELETE FROM audit_logs;
DELETE FROM session_tags;
DELETE FROM session_notes;
DELETE FROM recordings;
DELETE FROM files;
DELETE FROM messages;
DELETE FROM participants;
DELETE FROM invite_tokens;
DELETE FROM sessions;
DELETE FROM users;

INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at, updated_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'agent@atomberg.com',
    '$2b$10$vLWSHc/747r/9foAhLyLfeMld67dGb2gYSK20S8Bu2Oc7xWZA99Ny',
    'Aarav Mehta',
    'agent',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'customer@atomberg.com',
    '$2b$10$d5i9ZZNPSqT6yi5o2ws4Eef/cMpyLJxZwGO4JGU9VljVjOyLu/iQi',
    'Priya Shah',
    'customer',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'admin@atomberg.com',
    '$2b$10$3Se.jCevflS0LwLhXMK/9uvwLY65MBLSBwHAK534kCdv6q64.r3Ou',
    'Ops Admin',
    'admin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    NOW(),
    NOW()
  );

INSERT INTO sessions (id, agent_id, start_time, end_time, status, summary, ai_summary, created_at, updated_at)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '28 minutes',
    'ended',
    'Customer fan installation was verified over video. Agent identified incorrect regulator wiring and guided the customer through safe next steps.',
    '{"issue_summary":"Fan was not responding after installation","root_cause":"Regulator wiring mismatch","actions_taken":"Verified wiring visually, checked power state, shared installation checklist","resolution":"Customer confirmed fan was operational","next_steps":"Schedule electrician review if issue returns"}',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '28 minutes'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '18 minutes',
    'ended',
    'Warranty claim walkthrough completed with invoice screenshot shared in chat.',
    '{"issue_summary":"Customer needed warranty claim help","root_cause":"Missing serial number location","actions_taken":"Used video to locate label and file sharing for invoice","resolution":"Warranty form submitted","next_steps":"Customer will receive claim update by email"}',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '18 minutes'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '12 minutes',
    NULL,
    'active',
    NULL,
    NULL,
    NOW() - INTERVAL '12 minutes',
    NOW()
  );

INSERT INTO participants (session_id, user_id, role, joined_at, left_at, connection_quality, device_info)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'agent', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '28 minutes', 'good', '{"browser":"Chrome","os":"Windows","camera":"HD Webcam","microphone":"Default"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'customer', NOW() - INTERVAL '2 days' + INTERVAL '1 minute', NOW() - INTERVAL '2 days' + INTERVAL '28 minutes', 'good', '{"browser":"Chrome Mobile","os":"Android","camera":"Phone Camera","microphone":"Phone Mic"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'agent', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '18 minutes', 'good', '{"browser":"Edge","os":"Windows","camera":"HD Webcam","microphone":"Default"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'customer', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes', NOW() - INTERVAL '1 day' + INTERVAL '18 minutes', 'fair', '{"browser":"Safari","os":"iOS","camera":"Phone Camera","microphone":"Phone Mic"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'agent', NOW() - INTERVAL '12 minutes', NULL, 'good', '{"browser":"Chrome","os":"Windows","camera":"HD Webcam","microphone":"Default"}');

INSERT INTO messages (session_id, user_id, content, type, read_by, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'The fan turns on but speed control is not working.', 'text', ARRAY['22222222-2222-2222-2222-222222222222']::uuid[], NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Please show me the regulator wiring and the model label.', 'text', ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], NOW() - INTERVAL '2 days' + INTERVAL '3 minutes'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'I found the mismatch. I am sharing the installation checklist here.', 'text', ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'I cannot find the serial number for warranty registration.', 'text', ARRAY['22222222-2222-2222-2222-222222222222']::uuid[], NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Tilt the camera toward the bottom label. The serial number is below the QR code.', 'text', ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], NOW() - INTERVAL '1 day' + INTERVAL '4 minutes'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Live demo session is ready. Share the invite token with the customer browser.', 'text', ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], NOW() - INTERVAL '10 minutes');

INSERT INTO files (session_id, user_id, filename, size, type, url, preview_url, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Atomberg-Fan-Installation-Checklist.pdf', 524288, 'application/pdf', 'https://example.com/demo/fan-installation-checklist.pdf', NULL, NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Invoice-Screenshot.png', 384000, 'image/png', 'https://example.com/demo/invoice-screenshot.png', 'https://example.com/demo/invoice-screenshot.png', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes');

INSERT INTO recordings (session_id, status, duration, size, url, started_at, completed_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ready', 1680, 42000000, 'https://example.com/demo/recordings/installation-support.mp4', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '31 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ready', 1080, 30000000, 'https://example.com/demo/recordings/warranty-walkthrough.mp4', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '21 minutes');

INSERT INTO session_notes (session_id, created_by, content, is_private, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Visual verification avoided a field visit. Customer understood the safety boundary and next steps.', true, NOW() - INTERVAL '2 days' + INTERVAL '29 minutes', NOW() - INTERVAL '2 days' + INTERVAL '29 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Warranty flow completed. Customer shared invoice through chat.', true, NOW() - INTERVAL '1 day' + INTERVAL '19 minutes', NOW() - INTERVAL '1 day' + INTERVAL '19 minutes');

INSERT INTO session_tags (session_id, tag, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'installation', NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'troubleshooting', NOW() - INTERVAL '2 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'warranty', NOW() - INTERVAL '1 day'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'repair', NOW() - INTERVAL '12 minutes');

INSERT INTO invite_tokens (token, session_id, expires_at, created_at)
VALUES
  ('DEMO-CUSTOMER-JOIN', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() + INTERVAL '24 hours', NOW());

INSERT INTO audit_logs (action, actor_id, resource_type, resource_id, changes, created_at)
VALUES
  ('SESSION_CREATED', '11111111-1111-1111-1111-111111111111', 'SESSION', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"source":"demo_seed"}', NOW() - INTERVAL '2 days'),
  ('SESSION_ENDED', '11111111-1111-1111-1111-111111111111', 'SESSION', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"durationSeconds":1680}', NOW() - INTERVAL '2 days' + INTERVAL '28 minutes'),
  ('FILE_SHARED', '22222222-2222-2222-2222-222222222222', 'SESSION', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"filename":"Invoice-Screenshot.png"}', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  ('ADMIN_DASHBOARD_VIEWED', '33333333-3333-3333-3333-333333333333', 'ADMIN', 'dashboard', '{"source":"demo_seed"}', NOW() - INTERVAL '1 hour');

INSERT INTO analytics_events (event_name, user_id, session_id, event_data, timestamp)
VALUES
  ('call_started', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"participants":2,"mediaServer":"LiveKit","network":"good"}', NOW() - INTERVAL '2 days'),
  ('call_ended', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"resolution":"solved","durationSeconds":1680}', NOW() - INTERVAL '2 days' + INTERVAL '28 minutes'),
  ('file_shared', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"type":"image/png"}', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  ('active_demo_session_ready', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"inviteToken":"DEMO-CUSTOMER-JOIN"}', NOW() - INTERVAL '12 minutes');

INSERT INTO system_metrics (metric_name, value, timestamp)
VALUES
  ('active_sessions', 1, NOW()),
  ('connected_participants', 1, NOW()),
  ('ready_recordings', 2, NOW()),
  ('average_session_duration_seconds', 1380, NOW());

SELECT 'AtomAssist demo seed data loaded' AS message;
SELECT email, role FROM users ORDER BY role;
SELECT token, expires_at FROM invite_tokens;

