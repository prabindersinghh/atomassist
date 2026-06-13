-- ATOMASSIST DEMO SEED DATA
-- This script creates demo users, sessions, and data for recording demo videos
-- Run this AFTER running database.sql

-- Clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM audit_logs;
DELETE FROM analytics_events;
DELETE FROM system_metrics;
DELETE FROM session_tags;
DELETE FROM session_notes;
DELETE FROM recordings;
DELETE FROM files;
DELETE FROM messages;
DELETE FROM participants;
DELETE FROM invite_tokens;
DELETE FROM sessions;
DELETE FROM users;

-- Reset auto-increment sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE participants_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;
ALTER SEQUENCE recordings_id_seq RESTART WITH 1;
ALTER SEQUENCE session_notes_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE analytics_events_id_seq RESTART WITH 1;

-- Insert Demo Users
INSERT INTO users (name, email, role, password_hash, avatar_url, created_at, updated_at) VALUES
-- Agents
('Alex Johnson', 'alex@atomberg.com', 'agent', '$2b$10$salt.hash.here.for.demo1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', NOW(), NOW()),
('Sarah Chen', 'sarah@atomberg.com', 'agent', '$2b$10$salt.hash.here.for.demo2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', NOW(), NOW()),
('Mike Wilson', 'mike@atomberg.com', 'agent', '$2b$10$salt.hash.here.for.demo3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', NOW(), NOW()),

-- Customers
('John Doe', 'john@customer.com', 'customer', '$2b$10$salt.hash.here.for.demo4', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', NOW(), NOW()),
('Emma Davis', 'emma@customer.com', 'customer', '$2b$10$salt.hash.here.for.demo5', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', NOW(), NOW()),
('Robert Brown', 'robert@customer.com', 'customer', '$2b$10$salt.hash.here.for.demo6', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', NOW(), NOW()),

-- Admin
('Admin User', 'admin@atomberg.com', 'admin', '$2b$10$salt.hash.here.for.demo7', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', NOW(), NOW());

-- Insert Demo Sessions
INSERT INTO sessions (agent_id, customer_id, title, description, status, start_time, end_time, duration_seconds, created_at, updated_at) VALUES
-- Completed Sessions
(1, 4, 'Installation Issue - AC Unit', 'Customer reported AC not turning on. Resolved by resetting circuit breaker.', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 2700, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 5, 'Warranty Claim Help', 'Customer filing warranty claim for defective fan. Guided through process.', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 1800, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(1, 6, 'Remote Troubleshooting', 'Heater thermostat not responding. Fixed via remote configuration.', 'completed', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours' + INTERVAL '20 minutes', 1200, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

-- Active Session
(2, 4, 'Filter Replacement Guide', 'Customer learning how to replace air filter', 'active', NOW() - INTERVAL '15 minutes', NULL, NULL, NOW() - INTERVAL '15 minutes', NOW());

-- Insert Participants
INSERT INTO participants (session_id, user_id, joined_at, left_at, duration_seconds, connection_quality) VALUES
-- Session 1
(1, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 2700, 'excellent'),
(1, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 2700, 'good'),

-- Session 2
(2, 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 1800, 'good'),
(2, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 1800, 'excellent'),

-- Session 3
(3, 1, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours' + INTERVAL '20 minutes', 1200, 'excellent'),
(3, 6, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours' + INTERVAL '20 minutes', 1200, 'good'),

-- Session 4 (Active)
(4, 2, NOW() - INTERVAL '15 minutes', NULL, NULL, 'excellent'),
(4, 4, NOW() - INTERVAL '15 minutes', NULL, NULL, 'excellent');

-- Insert Messages (Chat History)
INSERT INTO messages (session_id, user_id, content, message_type, created_at) VALUES
-- Session 1 Messages
(1, 4, 'Hi, my AC unit stopped working', 'text', NOW() - INTERVAL '2 days'),
(1, 1, 'I can help you with that. Let me first check your model number.', 'text', NOW() - INTERVAL '2 days' + INTERVAL '30 seconds'),
(1, 1, 'Can you tell me when it last worked properly?', 'text', NOW() - INTERVAL '2 days' + INTERVAL '1 minute'),
(1, 4, 'It was working fine yesterday, stopped this morning', 'text', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'),
(1, 1, 'Let me share my screen to show you where the reset button is', 'text', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes'),
(1, 4, 'Found it! The issue is resolved now, thanks!', 'text', NOW() - INTERVAL '2 days' + INTERVAL '40 minutes'),

-- Session 2 Messages
(2, 5, 'Hi, I need to file a warranty claim', 'text', NOW() - INTERVAL '1 day'),
(2, 2, 'Of course! I can walk you through the process. Do you have your receipt?', 'text', NOW() - INTERVAL '1 day' + INTERVAL '1 minute'),
(2, 5, 'Yes, I have the email receipt', 'text', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
(2, 2, 'Perfect! Let me send you the warranty claim form', 'text', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes'),
(2, 2, 'You can see it on your screen now', 'text', NOW() - INTERVAL '1 day' + INTERVAL '4 minutes'),
(2, 5, 'Great, filling it out now', 'text', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),

-- Session 3 Messages
(3, 6, 'My thermostat is not responding', 'text', NOW() - INTERVAL '12 hours'),
(3, 1, 'No problem, I can help remotely. Let me connect to your device', 'text', NOW() - INTERVAL '12 hours' + INTERVAL '1 minute'),
(3, 1, 'I see the issue - it needs a firmware update', 'text', NOW() - INTERVAL '12 hours' + INTERVAL '3 minutes'),
(3, 1, 'Initiating update now...', 'text', NOW() - INTERVAL '12 hours' + INTERVAL '4 minutes'),
(3, 6, 'That was quick! Working now, thanks so much', 'text', NOW() - INTERVAL '12 hours' + INTERVAL '15 minutes'),

-- Session 4 Messages (Active)
(4, 4, 'Hi Sarah, thanks for helping me with the filter', 'text', NOW() - INTERVAL '10 minutes'),
(4, 2, 'Happy to help! Let me show you exactly where the filter is located', 'text', NOW() - INTERVAL '9 minutes'),
(4, 2, 'Can you see my screen now?', 'text', NOW() - INTERVAL '8 minutes'),
(4, 4, 'Yes, I see it! That makes sense', 'text', NOW() - INTERVAL '7 minutes');

-- Insert Files (Shared Documents)
INSERT INTO files (session_id, user_id, file_name, file_type, file_size, file_path, created_at) VALUES
(1, 1, 'AC-Troubleshooting-Guide.pdf', 'application/pdf', 2048000, 'files/session_1_ac_guide.pdf', NOW() - INTERVAL '2 days'),
(2, 2, 'Warranty-Claim-Form.pdf', 'application/pdf', 512000, 'files/session_2_warranty_form.pdf', NOW() - INTERVAL '1 day'),
(3, 1, 'Thermostat-Setup-Manual.pdf', 'application/pdf', 1024000, 'files/session_3_thermostat_manual.pdf', NOW() - INTERVAL '12 hours'),
(4, 2, 'Filter-Replacement-Guide.pdf', 'application/pdf', 768000, 'files/session_4_filter_guide.pdf', NOW() - INTERVAL '10 minutes');

-- Insert Recordings
INSERT INTO recordings (session_id, file_path, duration_seconds, file_size, status, created_at, completed_at) VALUES
(1, 'recordings/session_1_recording.mp4', 2700, 45000000, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
(2, 'recordings/session_2_recording.mp4', 1800, 28000000, 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes'),
(3, 'recordings/session_3_recording.mp4', 1200, 18000000, 'completed', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours' + INTERVAL '2 minutes');

-- Insert Session Notes
INSERT INTO session_notes (session_id, agent_id, content, is_private, created_at, updated_at) VALUES
(1, 1, 'Customer was very cooperative. Issue was simple circuit breaker reset. Provided troubleshooting guide for future reference.', true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 2, 'Warranty claim processed successfully. Customer had all necessary documentation. Claim number: WC-2024-001.', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(3, 1, 'Remote configuration performed successfully. Updated thermostat firmware from v1.2 to v1.5. Testing completed without issues.', true, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
(4, 2, 'Ongoing session - Customer learning filter replacement. Very engaged, asking detailed questions about maintenance.', true, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes');

-- Insert Session Tags
INSERT INTO session_tags (session_id, tag_name, created_at) VALUES
(1, 'Installation', NOW() - INTERVAL '2 days'),
(1, 'Troubleshooting', NOW() - INTERVAL '2 days'),
(2, 'Warranty', NOW() - INTERVAL '1 day'),
(2, 'Support', NOW() - INTERVAL '1 day'),
(3, 'Repair', NOW() - INTERVAL '12 hours'),
(3, 'Remote', NOW() - INTERVAL '12 hours'),
(4, 'Installation', NOW() - INTERVAL '10 minutes'),
(4, 'Maintenance', NOW() - INTERVAL '10 minutes');

-- Insert Invite Tokens
INSERT INTO invite_tokens (session_id, token, expires_at, created_at) VALUES
(4, 'demo_invite_token_' || random()::text || 'activeSession', NOW() + INTERVAL '1 hour', NOW());

-- Insert Audit Logs
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, created_at) VALUES
(1, 'session_created', 'session', 1, 'Session created for customer John Doe', NOW() - INTERVAL '2 days'),
(1, 'session_completed', 'session', 1, 'Session completed after 45 minutes', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes'),
(2, 'session_created', 'session', 2, 'Session created for customer Emma Davis', NOW() - INTERVAL '1 day'),
(2, 'session_completed', 'session', 2, 'Session completed after 30 minutes', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
(1, 'session_created', 'session', 3, 'Session created for customer Robert Brown', NOW() - INTERVAL '12 hours'),
(1, 'session_completed', 'session', 3, 'Session completed after 20 minutes', NOW() - INTERVAL '12 hours' + INTERVAL '20 minutes'),
(2, 'session_created', 'session', 4, 'Session created for customer John Doe', NOW() - INTERVAL '15 minutes'),
(7, 'admin_dashboard_accessed', 'admin', 0, 'Admin viewed dashboard', NOW() - INTERVAL '1 hour');

-- Insert Analytics Events
INSERT INTO analytics_events (session_id, event_name, event_data, created_at) VALUES
(1, 'call_started', '{"duration": 2700, "participants": 2, "video_quality": "high"}', NOW() - INTERVAL '2 days'),
(1, 'call_ended', '{"duration": 2700, "resolution": "solved"}', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes'),
(2, 'call_started', '{"duration": 1800, "participants": 2, "video_quality": "high"}', NOW() - INTERVAL '1 day'),
(2, 'call_ended', '{"duration": 1800, "resolution": "solved"}', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
(3, 'call_started', '{"duration": 1200, "participants": 2, "video_quality": "high"}', NOW() - INTERVAL '12 hours'),
(3, 'call_ended', '{"duration": 1200, "resolution": "solved"}', NOW() - INTERVAL '12 hours' + INTERVAL '20 minutes'),
(4, 'call_started', '{"duration": 900, "participants": 2, "video_quality": "high"}', NOW() - INTERVAL '15 minutes');

-- Insert System Metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, created_at) VALUES
('active_sessions', '1', 'count', NOW()),
('total_sessions_today', '4', 'count', NOW()),
('total_users_online', '3', 'count', NOW()),
('average_session_duration', '1675', 'seconds', NOW()),
('platform_uptime', '99.9', 'percentage', NOW()),
('recording_queue_size', '0', 'count', NOW());

-- Display seed data summary
SELECT 'Seed Data Loaded Successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_sessions FROM sessions;
SELECT COUNT(*) as total_messages FROM messages;
SELECT COUNT(*) as total_files FROM files;
SELECT COUNT(*) as total_recordings FROM recordings;
