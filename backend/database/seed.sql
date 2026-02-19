-- backend/database/seed.sql
-- PostgreSQL 16 compatible seed data for Ticket Shop
-- Run with: psql -h localhost -p 5432 -U postgres -d concert_db -f database/seed.sql

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing data (in correct order due to FK constraints)
TRUNCATE TABLE reservations CASCADE;
TRUNCATE TABLE concerts CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences (not needed for UUID but good practice)
ALTER SEQUENCE IF EXISTS reservations_id_seq RESTART WITH 1;

--------------------------------------------------------------------------------
-- USERS
-- Password hashes generated with bcryptjs (salt rounds: 10)
-- Default user password: "password123" -> $2a$10$YourHashHere
-- Admin password: "admin123" -> $2a$10$YourHashHere
--------------------------------------------------------------------------------

INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") VALUES

-- Admin users
('11111111-1111-1111-1111-111111111111',
 'admin@ticketshop.com',
 'System Administrator',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'admin',
 NOW(),
 NOW()),

-- Regular users
('22222222-2222-2222-2222-222222222222',
 'john.doe@email.com',
 'John Doe',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW()),

('22222222-2222-2222-2222-222222222223',
 'jane.smith@email.com',
 'Jane Smith',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW()),

('22222222-2222-2222-2222-222222222224',
 'mike.wilson@email.com',
 'Mike Wilson',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW()),

('22222222-2222-2222-2222-222222222225',
 'sarah.johnson@email.com',
 'Sarah Johnson',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW()),

('22222222-2222-2222-2222-222222222226',
 'david.brown@email.com',
 'David Brown',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW()),

('22222222-2222-2222-2222-222222222227',
 'emma.davis@email.com',
 'Emma Davis',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW()),

('22222222-2222-2222-2222-222222222228',
 'alex.martinez@email.com',
 'Alex Martinez',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6',
 'user',
 NOW(),
 NOW());

--------------------------------------------------------------------------------
-- CONCERTS
--------------------------------------------------------------------------------

INSERT INTO concerts (id, name, description, "totalSeats", "availableSeats", "createdAt", "updatedAt") VALUES

-- Rock/Pop concerts
('33333333-3333-3333-3333-333333333331',
 'Taylor Swift - Eras Tour',
 'Experience the magic of Taylor Swift''s record-breaking Eras Tour, a journey through all musical eras of her career. Featuring stunning visuals, surprise songs, and unforgettable performances.',
 50000,
 42150,
 NOW() - INTERVAL '30 days',
 NOW()),

('33333333-3333-3333-3333-333333333332',
 'Coldplay - Music of the Spheres',
 'Join Coldplay on their interstellar world tour featuring hits from their latest album alongside classic favorites. Expect spectacular light shows and LED wristbands for all attendees.',
 35000,
 28000,
 NOW() - INTERVAL '25 days',
 NOW()),

('33333333-3333-3333-3333-333333333333',
 'BTS - Yet to Come',
 'Witness the global phenomenon BTS live in concert. Experience their powerful performances, intricate choreography, and the energy of the ARMY.',
 80000,
 75000,
 NOW() - INTERVAL '20 days',
 NOW()),

-- Classical/Orchestra
('33333333-3333-3333-3333-333333333334',
 'Vienna Philharmonic - New Year''s Concert',
 'Start the year with the prestigious Vienna Philharmonic Orchestra performing traditional waltzes and polkas by the Strauss family in an elegant setting.',
 2500,
 500,
 NOW() - INTERVAL '60 days',
 NOW()),

('33333333-3333-3333-3333-333333333335',
 'Beethoven Symphony No. 9',
 'A powerful performance of Beethoven''s masterpiece Symphony No. 9 in D minor, featuring the famous "Ode to Joy" finale with full orchestra and choir.',
 1800,
 1200,
 NOW() - INTERVAL '15 days',
 NOW()),

-- Jazz/Blues
('33333333-3333-3333-3333-333333333336',
 'Jazz at Lincoln Center Orchestra',
 'Wynton Marsalis leads the world-renowned Jazz at Lincoln Center Orchestra in an evening of classic and contemporary jazz compositions.',
 3000,
 2500,
 NOW() - INTERVAL '10 days',
 NOW()),

-- Electronic/Dance
('33333333-3333-3333-3333-333333333337',
 'Tomorrowland Winter Festival',
 'The magical Tomorrowland experience comes to the mountains! Three days of electronic dance music featuring top DJs from around the world.',
 15000,
 13500,
 NOW() - INTERVAL '5 days',
 NOW()),

('33333333-3333-3333-3333-333333333338',
 'Deadmau5 - Cube v3 Tour',
 'Experience the progressive house mastermind Deadmau5 in his revolutionary LED cube stage setup with stunning visual productions.',
 8000,
 7200,
 NOW() - INTERVAL '8 days',
 NOW()),

-- Asian Pop/K-Pop
('33333333-3333-3333-3333-333333333339',
 'BLACKPINK - Born Pink World Tour',
 'BLACKPINK in your area! Catch Jennie, Lisa, Rosé, and Jisoo perform their biggest hits in this high-energy stadium show.',
 60000,
 58000,
 NOW() - INTERVAL '3 days',
 NOW()),

-- Rock/Metal
('33333333-3333-3333-3333-333333333340',
 'Metallica - M72 World Tour',
 'Metallica returns with their ambitious M72 tour featuring two unique sets over two nights, spanning their entire 40-year catalog.',
 45000,
 38000,
 NOW() - INTERVAL '12 days',
 NOW()),

('33333333-3333-3333-3333-333333333341',
 'Foo Fighters - Everything or Nothing',
 'Rock and Roll Hall of Famers Foo Fighters bring their high-energy rock show featuring classics and new material.',
 20000,
 18500,
 NOW() - INTERVAL '7 days',
 NOW()),

-- Thai Artists
('33333333-3333-3333-3333-333333333342',
 'Bodyslam - คอนเสิร์ต Bodyslam World',
 'ประสบการณ์ดนตรีที่ยิ่งใหญ่จาก Bodyslam วงดนตรีร็อคชื่อดังของไทย พร้อมเพลงฮิตที่ทุกคนจะต้องร้องตาม',
 12000,
 11000,
 NOW() - INTERVAL '4 days',
 NOW()),

('33333333-3333-3333-3333-333333333343',
 'Carabao - แดงเดือนดับ',
 'คอนเสิร์ตพิเศษจากวงการเต้แห่งประเทศไทย Carabao กับเพลงเพื่อชีวิตที่สะท้อนสังคมและจิตวิญญาณ',
 8000,
 7200,
 NOW() - INTERVAL '6 days',
 NOW()),

-- Local/Indie
('33333333-3333-3333-3333-333333333344',
 'Indie Music Festival 2026',
 'A celebration of independent music featuring emerging artists from various genres. Discover your next favorite band!',
 5000,
 4800,
 NOW() - INTERVAL '2 days',
 NOW()),

-- Special Events
('33333333-3333-3333-3333-333333333345',
 'NYE Countdown Party 2027',
 'Ring in 2027 with an incredible lineup of artists, fireworks, and celebrations. The ultimate New Year''s Eve party!',
 25000,
 0,
 NOW() - INTERVAL '1 day',
 NOW());

--------------------------------------------------------------------------------
-- RESERVATIONS
--------------------------------------------------------------------------------

INSERT INTO reservations (id, "userId", "concertId", status, "createdAt", "updatedAt") VALUES

-- John Doe's reservations
('44444444-4444-4444-4444-444444444441',
 '22222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333331',
 'active',
 NOW() - INTERVAL '10 days',
 NOW() - INTERVAL '10 days'),

('44444444-4444-4444-4444-444444444442',
 '22222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333332',
 'active',
 NOW() - INTERVAL '8 days',
 NOW() - INTERVAL '8 days'),

('44444444-4444-4444-4444-444444444443',
 '22222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333339',
 'active',
 NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '5 days'),

-- Jane Smith's reservations
('44444444-4444-4444-4444-444444444444',
 '22222222-2222-2222-2222-222222222223',
 '33333333-3333-3333-3333-333333333331',
 'active',
 NOW() - INTERVAL '9 days',
 NOW() - INTERVAL '9 days'),

('44444444-4444-4444-4444-444444444445',
 '22222222-2222-2222-2222-222222222223',
 '33333333-3333-3333-3333-333333333334',
 'active',
 NOW() - INTERVAL '15 days',
 NOW() - INTERVAL '15 days'),

-- Mike Wilson's reservations
('44444444-4444-4444-4444-444444444446',
 '22222222-2222-2222-2222-222222222224',
 '33333333-3333-3333-3333-333333333332',
 'active',
 NOW() - INTERVAL '7 days',
 NOW() - INTERVAL '7 days'),

('44444444-4444-4444-4444-444444444447',
 '22222222-2222-2222-2222-222222222224',
 '33333333-3333-3333-3333-333333333340',
 'active',
 NOW() - INTERVAL '4 days',
 NOW() - INTERVAL '4 days'),

-- Sarah Johnson's reservations
('44444444-4444-4444-4444-444444444448',
 '22222222-2222-2222-2222-222222222225',
 '33333333-3333-3333-3333-333333333336',
 'active',
 NOW() - INTERVAL '6 days',
 NOW() - INTERVAL '6 days'),

('44444444-4444-4444-4444-444444444449',
 '22222222-2222-2222-2222-222222222225',
 '33333333-3333-3333-3333-333333333331',
 'active',
 NOW() - INTERVAL '3 days',
 NOW() - INTERVAL '3 days'),

-- David Brown's reservations
('44444444-4444-4444-4444-444444444450',
 '22222222-2222-2222-2222-222222222226',
 '33333333-3333-3333-3333-333333333337',
 'active',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days'),

-- Emma Davis's reservations
('44444444-4444-4444-4444-444444444451',
 '22222222-2222-2222-2222-222222222227',
 '33333333-3333-3333-3333-333333333338',
 'active',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

('44444444-4444-4444-4444-444444444452',
 '22222222-2222-2222-2222-222222222227',
 '33333333-3333-3333-3333-333333333342',
 'active',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

-- Alex Martinez's reservations
('44444444-4444-4444-4444-444444444453',
 '22222222-2222-2222-2222-222222222228',
 '33333333-3333-3333-3333-333333333339',
 'active',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days'),

-- Cancelled reservations (for testing)
('44444444-4444-4444-4444-444444444454',
 '22222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 'cancelled',
 NOW() - INTERVAL '20 days',
 NOW() - INTERVAL '18 days'),

('44444444-4444-4444-4444-444444444455',
 '22222222-2222-2222-2222-222222222223',
 '33333333-3333-3333-3333-333333333335',
 'cancelled',
 NOW() - INTERVAL '25 days',
 NOW() - INTERVAL '22 days');

--------------------------------------------------------------------------------
-- VERIFICATION QUERIES
--------------------------------------------------------------------------------

-- Display summary of seeded data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Concerts', COUNT(*) FROM concerts
UNION ALL
SELECT 'Reservations', COUNT(*) FROM reservations;

-- Display reservation status breakdown
SELECT status, COUNT(*) as count
FROM reservations
GROUP BY status;

-- Display concerts with booking rates
SELECT
    name,
    "totalSeats",
    "availableSeats",
    ROUND((("totalSeats" - "availableSeats")::DECIMAL / "totalSeats" * 100), 2) as booked_percentage
FROM concerts
ORDER BY booked_percentage DESC;

--------------------------------------------------------------------------------
-- NOTES
--------------------------------------------------------------------------------
/*
Password Hash Information:
All user accounts use the same password for testing: "password123"
Bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3/ItB/XBG/eCknfIrqS6

To generate a new hash, run in Node.js:
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('yourpassword', 10);
console.log(hash);

Test Accounts:
- Admin: admin@ticketshop.com / password123
- User: john.doe@email.com / password123
- User: jane.smith@email.com / password123
- (All other users also use password123)
*/
