
const express = require('express');
const sqlite3 = require('sqlite3');

const PORT = 4200;

const app = express();
const db = new sqlite3.Database('cycling.db');

app.use(express.json());
app.use(express.static('public'));

db.run('PRAGMA foreign_keys = ON');

// 1. Search or browse riders
app.get('/riders', (req, res) => {
    const name = req.query.name || '';

    const sql =
        'SELECT rider_id, name, age, team_id ' +
        'FROM Riders WHERE name LIKE ? ORDER BY name';

    db.all(sql, ['%' + name + '%'], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

// 2. Display related data using JOIN
app.get('/teams/:id/riders', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid team ID'
        });
    }

    const sql =
        'SELECT r.name AS rider_name, r.age, ' +
        't.name AS team_name ' +
        'FROM Riders r JOIN Teams t ' +
        'ON r.team_id = t.team_id ' +
        'WHERE t.team_id = ? ORDER BY r.name';

    db.all(sql, [id], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

// 3. Add a rider
app.post('/riders', (req, res) => {
    const name = req.body.name;
    const team_id = Number(req.body.team_id);
    const age = req.body.age;

    if (typeof name !== 'string' || !name.trim() ||
        !Number.isInteger(team_id) || team_id <= 0 ||
        (age != null && age !== '' &&
            (!Number.isInteger(Number(age)) ||
                Number(age) < 0 || Number(age) > 120))) {
        return res.status(400).json({
            error: 'Invalid rider information'
        });
    }

    const sql =
        'INSERT INTO Riders (name, team_id, age) ' +
        'VALUES (?, ?, ?)';

    db.run(sql, [name.trim(), team_id, age === '' || age == null ? null : Number(age)], function (err) {
        if (err) {
            return res.status(400).json({
                error: 'Unable to add rider. Check the team ID.'
            });
        }

        res.json({
            rider_id: this.lastID,
            name: name.trim()
        });
    });
});

// 4. Update a rider's age
app.put('/riders/:id', (req, res) => {
    const id = Number(req.params.id);
    const age = Number(req.body.age);

    if (!Number.isInteger(id) || id <= 0 ||
        req.body.age == null || req.body.age === '' ||
        !Number.isInteger(age) || age < 0 || age > 120) {
        return res.status(400).json({
            error: 'Invalid rider ID or age'
        });
    }

    const sql =
        'UPDATE Riders SET age = ? WHERE rider_id = ?';

    db.run(sql, [age, id], function (err) {
        if (err) return res.sendStatus(500);

        if (this.changes === 0) {
            return res.status(404).json({
                error: 'Rider not found'
            });
        }

        res.json({ message: 'Rider updated' });
    });
});

// 5. Summary report: riders per team
app.get('/reports/teams', (req, res) => {
    const sql =
        'SELECT t.name AS team_name, ' +
        'COUNT(r.rider_id) AS total_riders ' +
        'FROM Teams t LEFT JOIN Riders r ' +
        'ON t.team_id = r.team_id ' +
        'GROUP BY t.team_id ' +
        'ORDER BY total_riders DESC';

    db.all(sql, [], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

// 6. Additional operation: Race results and course information
app.get('/races/:id/results', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid race ID'
        });
    }

    const sql =
        'SELECT event_name, race_start, course_name, course_distance, ' +
        'finish_position, rider_name, team_name ' +
        'FROM race_results WHERE race_id = ? ' +
        'ORDER BY finish_position';

    db.all(sql, [id], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

// 7. Additional operation: Show events
app.get('/events', (req, res) => {
    const sql = 'SELECT * FROM Events ORDER BY date';

    db.all(sql, [], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

// 8. Additional operation: Show vendors at an event
app.get('/events/:id/vendors', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid event ID'
        });
    }

    const sql =
        'SELECT v.name, v.category, ev.booth ' +
        'FROM EventVendors ev ' +
        'JOIN Vendors v ON ev.vendor_id = v.vendor_id ' +
        'WHERE ev.event_id = ?';

    db.all(sql, [id], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

// 9. Additional operation: Show teams at an event
app.get('/events/:id/teams', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid event ID'
        });
    }

    const sql =
        'SELECT t.name, t.home_city, t.coach_name ' +
        'FROM EventTeams et ' +
        'JOIN Teams t ON et.team_id = t.team_id ' +
        'WHERE et.event_id = ?';

    db.all(sql, [id], (err, rows) => {
        if (err) return res.sendStatus(500);

        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});
