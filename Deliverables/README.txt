
* Setup Instructions

1. Install sqlite3 onto machine
2. run: sqlite3 test.db < schema.sql
        sqlite3 test.db < insert_data.sql
        Optional for viewing:
        sqlite3 test.db < view_data.sql

* View

1. The view I implemented is called race_results. It easily displays all of the riders results for every race.
2. The tables it uses are RaceParticipants, Races, Events, Courses, Riders, and Teams
3. This creates a easy to use table to view all results. It will be useful later for filtering later in the project for team wins, events, wins, wins per team, etc. This will remove the need to join 6 tables every we need these results.

* Indexes

1. event_races        - The event_id in the Races table is indexed to support looking up all the races for an event.
2. team_racers        - The team_id in the Riders table is used to search for all the riders on a team.
3. rider_race_results - The column indexed is rider_id in RaceParticipants in order to to find all races and results for a specific rider.

* Design Changes

- There were no changes from my previously submitted ERD.