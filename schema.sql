PRAGMA foreign_keys = ON;

DROP VIEW  IF EXISTS race_results;
DROP INDEX IF EXISTS team_racers;
DROP INDEX IF EXISTS event_races;
DROP INDEX IF EXISTS rider_race_results;

DROP TABLE IF EXISTS EventVendors;
DROP TABLE IF EXISTS EventTeams;
DROP TABLE IF EXISTS RaceParticipants;
DROP TABLE IF EXISTS Races;
DROP TABLE IF EXISTS Riders;
DROP TABLE IF EXISTS Vendors;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Teams;


CREATE TABLE Teams (
    team_id     INTEGER PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    home_city   TEXT NOT NULL,
    coach_name  TEXT
);

CREATE TABLE Riders (
    rider_id  INTEGER PRIMARY KEY,
    team_id   INTEGER NOT NULL,
    name      TEXT NOT NULL,
    age       INTEGER,
    FOREIGN KEY (team_id) REFERENCES Teams(team_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT -- don't delete a team that still has riders
);

CREATE TABLE Courses (
    course_id  INTEGER PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    distance   REAL NOT NULL CHECK (distance > 0),
    location   TEXT NOT NULL
);

CREATE TABLE Events (
    event_id  INTEGER PRIMARY KEY,
    name      TEXT NOT NULL,
    date      TEXT NOT NULL,
    location  TEXT NOT NULL
);

CREATE TABLE Races (
    race_id      INTEGER PRIMARY KEY,
    course_id    INTEGER NOT NULL,
    event_id     INTEGER NOT NULL,
    race_start   TEXT NOT NULL,
    winner_id    INTEGER,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (event_id)  REFERENCES Events(event_id)
        ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES Riders(rider_id)
        ON DELETE SET NULL
);

CREATE TABLE Vendors (
    vendor_id  INTEGER PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    category   TEXT NOT NULL DEFAULT 'General',  -- e.x. Food, Gear, Drinks
);

CREATE TABLE RaceParticipants (
    race_id          INTEGER NOT NULL,
    rider_id         INTEGER NOT NULL,
    finish_position  INTEGER CHECK (finish_position IS NULL OR finish_position >= 1),
    PRIMARY KEY (race_id, rider_id), -- a rider can only enter a race once
    FOREIGN KEY (race_id)  REFERENCES Races(race_id)   ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES Riders(rider_id) ON DELETE CASCADE,
    UNIQUE (race_id, finish_position)
);

CREATE TABLE EventTeams (
    event_id  INTEGER NOT NULL,
    team_id   INTEGER NOT NULL,
    PRIMARY KEY (event_id, team_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id)  REFERENCES Teams(team_id)   ON DELETE CASCADE
);

CREATE TABLE EventVendors (
    event_vendor_id  INTEGER PRIMARY KEY,
    event_id         INTEGER NOT NULL,
    vendor_id        INTEGER NOT NULL, -- not making vendors bound to event since it is possible for a
                                 -- vendor to have multiple entries (booths)
    booth            INTEGER,
    FOREIGN KEY (event_id)  REFERENCES Events(event_id)   ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id) ON DELETE CASCADE
);

CREATE INDEX event_races ON Races(event_id);

CREATE INDEX team_racers ON Riders(team_id);

CREATE INDEX rider_race_results ON RaceParticipants(rider_id);

CREATE VIEW race_results AS
SELECT
    e.name             AS event_name,
    e.date             AS event_date,
    r.race_id          AS race_id,
    r.race_start       AS race_start,
    c.name             AS course_name,
    c.distance         AS course_distance,
    rp.finish_position AS finish_position,
    ri.name            AS rider_name,
    t.name             AS team_name,
    (r.winner_id = ri.rider_id) AS is_winner
FROM RaceParticipants rp
JOIN Races   r  ON r.race_id    = rp.race_id
JOIN Events  e  ON e.event_id   = r.event_id
JOIN Courses c  ON c.course_id  = r.course_id
JOIN Riders  ri ON ri.rider_id  = rp.rider_id
JOIN Teams   t  ON t.team_id    = ri.team_id;