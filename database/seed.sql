-- ============================================
-- ROUTEUR LOGISTICS - Seed Data (Algeria Version)
-- ============================================

-- Clear existing data
-- Order matters due to foreign key constraints
DELETE FROM bookings;
DELETE FROM payments;
DELETE FROM documents;
DELETE FROM trips;
DELETE FROM bids;
DELETE FROM shipments;
DELETE FROM users;
DELETE FROM companies;

-- ============================================
-- Sample Companies (Algeria)
-- ============================================

INSERT INTO companies (id, name, type, address, phone, verified) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alger Transport Pro', 'carrier',
 'Zone Industrielle Rouiba, Alger, Algeria', '+213699754824', true),

('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Sahara Logistics', 'carrier',
 'Hai El Badr, Oran, Algeria', '+213550112233', true),

('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Atlas Electronics DZ', 'shipper',
 'Zone Industrielle Sétif, Algeria', '+213661445566', true),

('d4e5f6a7-b8c9-0123-defa-234567890123', 'Green Agro Export DZ', 'shipper',
 'Blida Centre, Algeria', '+213770889900', false);


-- ============================================
-- Sample Users
-- Password = Password123
-- ============================================

INSERT INTO users
(id, email, password_hash, first_name, last_name, role, company_id)
VALUES

('11111111-1111-1111-1111-111111111111',
 'carrier@algertransport.dz',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Karim', 'Benali', 'carrier',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

('22222222-2222-2222-2222-222222222222',
 'carrier@saharalogistics.dz',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Yacine', 'Meziane', 'carrier',
 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),

('33333333-3333-3333-3333-333333333333',
 'shipper@atlasdz.com',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Nadia', 'Hamidi', 'shipper',
 'c3d4e5f6-a7b8-9012-cdef-123456789012'),

('44444444-4444-4444-4444-444444444444',
 'shipper@greenagro.dz',
 '$2a$12$HxQec8eX7lmMsiglbwoBZuSdnVEdAHhyXjPHmttV1sYipvfAXV7wi',
 'Sofiane', 'Rahmani', 'shipper',
 'd4e5f6a7-b8c9-0123-defa-234567890123');


-- ============================================
-- Sample Shipments (Algeria Routes)
-- ============================================

INSERT INTO shipments
(title, description, origin, destination,
 weight, dimensions, pickup_date,
 delivery_date, budget, status, shipper_id)
VALUES

('Electronic Goods Alger → Oran',
 'TVs and electronics pallet shipment',
 'Alger, Algeria',
 'Oran, Algeria',
 1800.00,
 '120x80x100 cm',
 '2026-03-01',
 '2026-03-03',
 320000.00,
 'pending',
 '33333333-3333-3333-3333-333333333333'),

('Agricultural Products Blida → Constantine',
 'Fresh vegetables refrigerated transport',
 'Blida, Algeria',
 'Constantine, Algeria',
 2800.00,
 '240x120x150 cm',
 '2026-03-10',
 '2026-03-12',
 410000.00,
 'pending',
 '44444444-4444-4444-4444-444444444444'),

('Industrial Machines Sétif → Ouargla',
 'Heavy equipment transport',
 'Sétif, Algeria',
 'Ouargla, Algeria',
 9000.00,
 '600x250x300 cm',
 '2026-03-15',
 '2026-03-20',
 750000.00,
 'pending',
 '33333333-3333-3333-3333-333333333333');
