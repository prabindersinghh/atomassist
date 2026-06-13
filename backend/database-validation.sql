-- ATOMASSIST DATABASE VALIDATION SCRIPT
-- Run this to verify all tables, columns, and indexes are created correctly

-- Check if all tables exist
SELECT 
    table_name
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
ORDER BY 
    table_name;

-- Verify key tables
\d+ users
\d+ sessions
\d+ participants
\d+ messages
\d+ files
\d+ recordings
\d+ session_notes
\d+ session_tags
\d+ invite_tokens
\d+ audit_logs
\d+ analytics_events
\d+ system_metrics

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM 
    pg_indexes 
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, indexname;

-- Verify foreign key relationships
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
ORDER BY 
    tc.table_name, tc.constraint_name;

-- Summary
SELECT 
    COUNT(*) as table_count
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public';
