-- This transaction enters the information of race 9 including where all of the riders finished.

PRAGMA foreign_keys = ON;

.mode box
.headers on

-- State before the updates
SELECT race_id, rider_id, finish_position
FROM RaceParticipants WHERE race_id = 9 ORDER BY rider_id;

BEGIN TRANSACTION;

UPDATE RaceParticipants SET finish_position = 1 WHERE race_id = 9 AND rider_id = 9;
UPDATE RaceParticipants SET finish_position = 2 WHERE race_id = 9 AND rider_id = 2;
UPDATE RaceParticipants SET finish_position = 3 WHERE race_id = 9 AND rider_id = 11;
UPDATE RaceParticipants SET finish_position = 4 WHERE race_id = 9 AND rider_id = 4;

UPDATE Races
SET winner_id = (SELECT rider_id
                 FROM RaceParticipants
                 WHERE race_id = 9 AND finish_position = 1)
WHERE race_id = 9;

SELECT finish_position, rider_name, team_name, is_winner
FROM race_results
WHERE race_id = 9
ORDER BY finish_position;

-- Undo everything above. Use COMMIT instead to save the results.
-- ROLLBACK;
COMMIT;
