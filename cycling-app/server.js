const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;
const DB_PATH = path.join(__dirname, 'cycling.db');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database at', DB_PATH);
        // Enable Foreign Keys
        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) console.error('Failed to enable foreign keys:', pragmaErr.message);
        });
    }
});

// Helper for DB queries (Promises)
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
    });
});

// Helper API for dropdown menus in UI
app.get('/api/lookup-data', async (req, res) => {
    try {
        const teams = await dbAll('SELECT team_id, name FROM Teams ORDER BY name');
        const races = await dbAll(`
            SELECT r.race_id, e.name AS event_name, r.race_start 
            FROM Races r 
            JOIN Events e ON e.event_id = r.event_id 
            ORDER BY r.race_start
        `);
        const riders = await dbAll('SELECT rider_id, name FROM Riders ORDER BY name');
        res.json({ success: true, teams, races, riders });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load lookup options.' });
    }
});

// ============================================================================
// REQUIREMENT 1: Search or Browse Data
// Search riders by name pattern or age range
// ============================================================================
app.get('/api/riders/search', async (req, res) => {
    try {
        const { name, minAge, maxAge } = req.query;
        let sql = `
            SELECT r.rider_id, r.name AS rider_name, r.age, t.name AS team_name 
            FROM Riders r
            JOIN Teams t ON t.team_id = r.team_id
            WHERE 1=1
        `;
        const params = [];

        if (name && name.trim() !== '') {
            sql += ` AND r.name LIKE ?`;
            params.push(`%${name.trim()}%`);
        }
        if (minAge && !isNaN(parseInt(minAge, 10))) {
            sql += ` AND r.age >= ?`;
            params.push(parseInt(minAge, 10));
        }
        if (maxAge && !isNaN(parseInt(maxAge, 10))) {
            sql += ` AND r.age <= ?`;
            params.push(parseInt(maxAge, 10));
        }

        sql += ` ORDER BY r.name ASC`;

        const rows = await dbAll(sql, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database search error: ' + err.message });
    }
});

// ============================================================================
// REQUIREMENT 2: Display Related Data (Joins)
// Detailed roster of teams, their riders, and total races participated in
// ============================================================================
app.get('/api/teams/roster-details', async (req, res) => {
    try {
        const { teamId } = req.query;
        let sql = `
            SELECT 
                t.name AS team_name,
                t.home_city,
                t.coach_name,
                r.rider_id,
                r.name AS rider_name,
                r.age,
                COUNT(rp.race_id) AS total_races_entered
            FROM Teams t
            JOIN Riders r ON r.team_id = t.team_id
            LEFT JOIN RaceParticipants rp ON rp.rider_id = r.rider_id
        `;
        const params = [];

        if (teamId && !isNaN(parseInt(teamId, 10))) {
            sql += ` WHERE t.team_id = ?`;
            params.push(parseInt(teamId, 10));
        }

        sql += ` GROUP BY r.rider_id ORDER BY t.name, r.name`;

        const rows = await dbAll(sql, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database join error: ' + err.message });
    }
});

// ============================================================================
// REQUIREMENT 3: Add Data (INSERT)
// Register a new rider on an existing team
// ============================================================================
app.post('/api/riders', async (req, res) => {
    try {
        const { name, team_id, age } = req.body;

        // Input Validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Validation Error: Rider name is required.' });
        }
        const parsedTeamId = parseInt(team_id, 10);
        if (isNaN(parsedTeamId) || parsedTeamId <= 0) {
            return res.status(400).json({ success: false, error: 'Validation Error: Valid Team selection is required.' });
        }
        let parsedAge = null;
        if (age !== undefined && age !== null && age !== '') {
            parsedAge = parseInt(age, 10);
            if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
                return res.status(400).json({ success: false, error: 'Validation Error: Age must be between 10 and 120.' });
            }
        }

        // Verify team exists
        const teamExists = await dbGet('SELECT team_id FROM Teams WHERE team_id = ?', [parsedTeamId]);
        if (!teamExists) {
            return res.status(404).json({ success: false, error: 'Selected Team does not exist.' });
        }

        const result = await dbRun(
            'INSERT INTO Riders (team_id, name, age) VALUES (?, ?, ?)',
            [parsedTeamId, name.trim(), parsedAge]
        );

        res.status(201).json({
            success: true,
            message: `Rider "${name.trim()}" successfully registered with ID ${result.lastID}.`,
            rider_id: result.lastID
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to add rider: ' + err.message });
    }
});

// ============================================================================
// REQUIREMENT 4: Update or Delete Data
// Update rider info or remove a rider
// ============================================================================
app.put('/api/riders/:id', async (req, res) => {
    try {
        const riderId = parseInt(req.params.id, 10);
        const { name, team_id, age } = req.body;

        if (isNaN(riderId)) {
            return res.status(400).json({ success: false, error: 'Invalid Rider ID.' });
        }
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Validation Error: Name cannot be empty.' });
        }

        const parsedTeamId = parseInt(team_id, 10);
        const parsedAge = age ? parseInt(age, 10) : null;

        const result = await dbRun(
            'UPDATE Riders SET name = ?, team_id = ?, age = ? WHERE rider_id = ?',
            [name.trim(), parsedTeamId, parsedAge, riderId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: `Rider with ID ${riderId} not found.` });
        }

        res.json({ success: true, message: `Rider ID ${riderId} updated successfully.` });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Update failed: ' + err.message });
    }
});

app.delete('/api/riders/:id', async (req, res) => {
    try {
        const riderId = parseInt(req.params.id, 10);
        if (isNaN(riderId)) {
            return res.status(400).json({ success: false, error: 'Invalid Rider ID.' });
        }

        const result = await dbRun('DELETE FROM Riders WHERE rider_id = ?', [riderId]);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: `Rider with ID ${riderId} not found.` });
        }

        res.json({ success: true, message: `Rider ID ${riderId} successfully deleted.` });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Delete failed: ' + err.message });
    }
});

// ============================================================================
// REQUIREMENT 5: Summary or Report
// Team standings report using VIEW (race_results), Aggregate COUNT, GROUP BY
// ============================================================================
app.get('/api/reports/team-standings', async (req, res) => {
    try {
        const sql = `
            SELECT 
                team_name,
                COUNT(*) AS total_entries,
                SUM(CASE WHEN finish_position = 1 THEN 1 ELSE 0 END) AS first_places,
                SUM(CASE WHEN finish_position = 2 THEN 1 ELSE 0 END) AS second_places,
                SUM(CASE WHEN finish_position = 3 THEN 1 ELSE 0 END) AS third_places,
                ROUND(AVG(finish_position), 2) AS avg_finish_position
            FROM race_results
            WHERE finish_position IS NOT NULL
            GROUP BY team_name
            ORDER BY first_places DESC, second_places DESC, third_places DESC
        `;

        const rows = await dbAll(sql);
        res.json({ success: true, report_name: 'Team Performance & Podium Standings', data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Report generation error: ' + err.message });
    }
});

// ============================================================================
// REQUIREMENT 6: Additional Meaningful Operation
// Vendor presence across scheduled events
// ============================================================================
app.get('/api/reports/event-vendors', async (req, res) => {
    try {
        const sql = `
            SELECT 
                e.name AS event_name,
                e.date AS event_date,
                v.name AS vendor_name,
                v.category,
                ev.booth
            FROM EventVendors ev
            JOIN Events e ON e.event_id = ev.event_id
            JOIN Vendors v ON v.vendor_id = ev.vendor_id
            ORDER BY e.date, v.category, v.name
        `;

        const rows = await dbAll(sql);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to retrieve event vendor details: ' + err.message });
    }
});

// ============================================================================
// TRANSACTION DEMONSTRATION
// Update finish positions for a race and automatically determine & set winner
// ============================================================================
app.post('/api/races/record-results-transaction', async (req, res) => {
    const { race_id, finishes } = req.body; 
    // finishes expected as array of { rider_id: number, finish_position: number }

    if (!race_id || !Array.isArray(finishes) || finishes.length === 0) {
        return res.status(400).json({ success: false, error: 'Validation Error: race_id and finishes array required.' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Transaction start failed.' });

            let errorOccurred = false;

            // Step 1: Update finish positions
            const updateStmt = db.prepare('UPDATE RaceParticipants SET finish_position = ? WHERE race_id = ? AND rider_id = ?');
            
            for (const item of finishes) {
                updateStmt.run([item.finish_position, race_id, item.rider_id], (err) => {
                    if (err) errorOccurred = true;
                });
            }
            updateStmt.finalize();

            // Step 2: Update race winner in Races table using subquery
            const updateWinnerSql = `
                UPDATE Races
                SET winner_id = (
                    SELECT rider_id 
                    FROM RaceParticipants 
                    WHERE race_id = ? AND finish_position = 1
                )
                WHERE race_id = ?
            `;

            db.run(updateWinnerSql, [race_id, race_id], function(err) {
                if (err || errorOccurred) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, error: 'Transaction failed and was rolled back: ' + (err ? err.message : 'Participant update failed') });
                }

                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ success: false, error: 'Commit failed.' });
                    }
                    res.json({ success: true, message: `Race ${race_id} results recorded and winner updated successfully via multi-step transaction.` });
                });
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Cycling App Server running at http://localhost:${PORT}`);
});