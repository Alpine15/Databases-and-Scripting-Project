# Final README

# Project Overview

- This system provides a management application for cycling events. It stores information about riders, teams, races, courses, events, and vendors. The intended users are cycling event organizers who need to track race participation, results, and event registrations. Also, it can also be for spectators who are planning on going to event to see which vendors will be there and who won which races. The web application allows users to search for riders, add, riders, update rider ages, view team rosters, see race results, look up events, participating teams, and vendors.

# DBMS

- The project uses SQLite3. No hosted database account or login is required.

## Database Setup

- Install SQLite3 to perform terminal commands.

- From the root of directions `cd Deliverables`. Then run `sqlite3 test.db < schema.sql`, this will create the schema for the db. After that run `sqlite3 test.db < insert_data.sql`. If you want to view the data, execute the transaction, or execute the queries run the corresponding files using the same format as above.

- To run the created database for the application run `cp test.db ../cycling-app/cycling.db` to replace the old database with the one created above.
