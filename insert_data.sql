PRAGMA foreign_keys = ON;

DELETE FROM EventVendors;
DELETE FROM EventTeams;
DELETE FROM RaceParticipants;
DELETE FROM Races;
DELETE FROM Vendors;
DELETE FROM Events;
DELETE FROM Courses;
DELETE FROM Riders;
DELETE FROM Teams;

INSERT INTO Teams (name, home_city, coach_name) VALUES
('Iron Wheel Racing',       'Knoxville',   'Dana Whitfield'),
('Smoky Mountain Cyclists', 'Gatlinburg',  'Ray Calloway'),
('Volunteer Velo',          'Nashville',   'Sonia Reyes'),
('Chattanooga Chain Gang',  'Chattanooga', 'Tom Hendricks'),
('Bristol Bikers',          'Bristol',     NULL),
('Cumberland Cranks',       'Crossville',  'Lena Park');

INSERT INTO Riders (team_id, name, age) VALUES
(1, 'Maya Brooks',     24),
(1, 'Jordan Ellis',    29),
(1, 'Priya Nair',      21),
(1, 'Cole Whitaker',   35),
(2, 'Elena Ruiz',      27),
(2, 'Marcus Hale',     31),
(2, 'Tessa Lindgren',  19),
(3, 'Devon Carter',    26),
(3, 'Hannah Kim',      33),
(3, 'Isaac Boone',     41),
(3, 'Naomi Fields',    23),
(4, 'Luca Moretti',    28),
(4, 'Grace Okafor',    25),
(4, 'Ben Sutter',      NULL),
(5, 'Riley Dawson',    22),
(5, 'Omar Haddad',     45);

INSERT INTO Courses (name, distance, location) VALUES
('Cades Cove Loop',            18.5, 'Townsend, TN'),
('Neyland Greenway Sprint',    12.0, 'Knoxville, TN'),
('Lookout Mountain Climb',     24.8, 'Chattanooga, TN'),
('Bristol Speedway Criterium',  5.2, 'Bristol, TN'),
('Nashville River Road',       40.0, 'Nashville, TN');

INSERT INTO Events (name, date, location) VALUES
('Spring Opener',           '2026-03-14', 'Knoxville, TN'),
('Smoky Mountain Classic',  '2026-05-09', 'Townsend, TN'),
('Summer Criterium Series', '2026-07-18', 'Bristol, TN'),
('Fall Century Challenge',  '2026-10-10', 'Chattanooga, TN'),
('Holiday Charity Ride',    '2026-12-12', 'Knoxville, TN');

INSERT INTO Races (course_id, event_id, race_start, winner_id) VALUES
(2, 1, '2026-03-14 09:00',  8),
(2, 1, '2026-03-14 13:00',  1),
(1, 2, '2026-05-09 08:30',  5),
(1, 2, '2026-05-09 14:00',  7),
(4, 3, '2026-07-18 10:00', 12),
(4, 3, '2026-07-18 15:00', 13),
(3, 4, '2026-10-10 08:00',  1),
(3, 4, '2026-10-10 13:00',  5),
(2, 5, '2026-12-12 10:00', NULL);

INSERT INTO Vendors (name, category) VALUES
('Trailhead Coffee Co.',       'Drinks'),
('Smoky Mountain BBQ',         'Food'),
('Spoke & Chain Bike Shop',    'Gear'),
('Peak Performance Nutrition', 'Nutrition'),
('Valley Cycling Apparel',     'Gear');

INSERT INTO Vendors (name) VALUES
('Local Artisan Market');

INSERT INTO RaceParticipants (race_id, rider_id, finish_position) VALUES
(1, 8, 1), (1, 1, 2), (1, 5, 3), (1, 12, 4), (1, 15, 5),
(2, 1, 1), (2, 2, 2), (2, 9, 3), (2, 6, 4), (2, 13, 5),
(3, 5, 1), (3, 6, 2), (3, 1, 3), (3, 8, 4), (3, 12, 5), (3, 3, NULL),
(4, 7, 1), (4, 5, 2), (4, 9, 3), (4, 2, 4), (4, 13, 5),
(5, 12, 1), (5, 13, 2), (5, 8, 3), (5, 1, 4), (5, 15, 5), (5, 10, 6),
(6, 13, 1), (6, 12, 2), (6, 3, 3), (6, 11, 4), (6, 14, NULL),
(7, 1, 1), (7, 12, 2), (7, 5, 3), (7, 9, 4), (7, 4, 5), (7, 14, NULL),
(8, 5, 1), (8, 1, 2), (8, 10, 3), (8, 13, 4), (8, 11, 5),
(9, 2, NULL), (9, 4, NULL), (9, 9, NULL), (9, 11, NULL);

INSERT INTO EventTeams (event_id, team_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 3), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3), (4, 4),
(5, 1), (5, 2), (5, 3);

INSERT INTO EventVendors (event_id, vendor_id, booth) VALUES
(1, 1, 1), (1, 2, 2), (1, 3, 3),
(2, 1, 1), (2, 2, 2), (2, 2, 3), (2, 4, 4), (2, 5, 5),
(3, 1, 1), (3, 3, 2), (3, 5, 3),
(4, 1, 1), (4, 2, 2), (4, 3, 3), (4, 4, 4),
(5, 1, 1), (5, 2, NULL);