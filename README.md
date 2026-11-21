# Final README

# Project Overview

- This system provides a management application for cycling events. It stores information about riders, teams, races, courses, events, and vendors. The intended users are cycling event organizers who need to track race participation, results, and event registrations. Also, it can also be for spectators who are planning on going to event to see which vendors will be there and who won which races. The web application allows users to search for riders, add, riders, update rider ages, view team rosters, see race results, look up events, participating teams, and vendors.

# DBMS

- The project uses SQLite3. No hosted database account or login is required.

## Database Setup

- Install SQLite3 to perform terminal commands.

- From the root of directions `cd Deliverables`. Then run `sqlite3 test.db < schema.sql`, this will create the schema for the db. After that run `sqlite3 test.db < insert_data.sql`. If you want to view the data, execute the transaction, or execute the queries run the corresponding files using the same format as above.

- To run the created database for the application run `cp test.db ../cycling-app/cycling.db` to replace the old database with the one created above.

# Application Setup

- The application uses JavaScript(Node.js), Express, and the sqlite3 Node.js package.

1. Install Node.js, npm, and sqlite3.
1. From the repository root, `cd cycling-app` and run `npm ci` to install the dependencies.
1. Confirm that cycling.db exists since the application runs off this database.
1. Start the application be running `node server.js`
1. Lastly, navigate to http://localhost:4200 on a web browser to access the application.
