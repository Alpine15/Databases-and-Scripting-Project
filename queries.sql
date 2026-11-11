PRAGMA foreign_keys = ON;

.mode box
.headers on

-- Requirement 1: Filtering and Sorting
-- Lists riders aged 30 or older, oldest first
-- Could be used for certain league rankings
SELECT rider_id,
       name AS rider_name,
       age
FROM Riders
WHERE age >= 30
ORDER BY age DESC;

-- Requirement 2: INNER JOIN
-- Shows each rider with the team they ride for and the team's home city.
-- Useful for a printed rider roster.
SELECT r.name      AS rider_name,
       t.name      AS team_name,
       t.home_city AS team_home_city
FROM Riders r
INNER JOIN Teams t ON t.team_id = r.team_id
ORDER BY t.name, r.name;

-- Requirement 3: LEFT JOIN
-- Lists every team with its coach, including teams that have no coach
-- yet. Helps organizers spot teams that still need to submit a roster.
SELECT t.name                          AS team_name,
       t.coach_name                    AS coach
FROM Teams t
LEFT JOIN Riders r ON r.team_id = t.team_id
ORDER BY t.name, r.name;

-- Requirement 4: Three-Table Join
-- Race schedule for every race, the event it belongs to, when it starts,
-- and which course it is run on. This combines Races, Events, and Courses.
SELECT e.name       AS event_name,
       r.race_start AS race_start,
       c.name       AS course_name,
       c.distance   AS distance_km,
       c.location   AS course_location
FROM Races r
INNER JOIN Events  e ON e.event_id  = r.event_id
INNER JOIN Courses c ON c.course_id = r.course_id
ORDER BY r.race_start;

-- Requirement 5: Aggregate Query
-- Summary statistics for the rider pool. Including how many riders are registered
-- and their youngest, oldest, and average age.
SELECT COUNT(*)           AS total_riders,
       MIN(age)           AS youngest_age,
       MAX(age)           AS oldest_age,
       ROUND(AVG(age), 1) AS average_age
FROM Riders;

-- Requirement 6: GROUP BY and HAVING
-- Teams with at least 2 race wins, with their win totals. Groups races by
-- the winning rider's team, then keeps only the more successful teams.
SELECT t.name       AS team_name,
       COUNT(*)     AS race_wins
FROM Races r
INNER JOIN Riders ri ON ri.rider_id = r.winner_id
INNER JOIN Teams  t  ON t.team_id   = ri.team_id
GROUP BY t.team_id, t.name
HAVING COUNT(*) >= 2
ORDER BY race_wins DESC;

-- Requirement 7: Subquery
-- Finds riders who have never entered a race. The subquery returns every
-- rider who has at least one race entry.
-- Useful for following up with inactive riders.
SELECT rider_id,
       name AS rider_name
FROM Riders
WHERE rider_id NOT IN (SELECT rider_id FROM RaceParticipants)
ORDER BY name;

-- Requirement 8: Set Operation
-- Teams that competed at the Spring Opener but did not return for the
-- Fall Century Challenge. Both SELECTs list team names registered for an
-- event, so the sets are directly comparable. Helps track team retention.
SELECT t.name AS team_name
FROM Teams t
INNER JOIN EventTeams et ON et.team_id  = t.team_id
INNER JOIN Events e      ON e.event_id  = et.event_id
WHERE e.name = 'Spring Opener'
EXCEPT
SELECT t.name
FROM Teams t
INNER JOIN EventTeams et ON et.team_id  = t.team_id
INNER JOIN Events e      ON e.event_id  = et.event_id
WHERE e.name = 'Fall Century Challenge';

-- Requirement 9: View
-- Podium report: every top-3 finish with event, rider, and team. The
-- race_results view already joins six tables, so this report needs
-- no joins of its own.
SELECT event_name,
       race_start,
       finish_position,
       rider_name,
       team_name
FROM race_results
WHERE finish_position <= 3
ORDER BY race_start, finish_position;
