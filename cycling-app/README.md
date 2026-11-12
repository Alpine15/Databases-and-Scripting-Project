# Programming Language

- The server was written with javascript

# Database Connection

- Use sqlite3 for the database and express to communicate between the frontend and backend.

# Required

- Node
- SQLite3

# Required Packages

- To install the dependency from the package.json run `npm ci`

# Starting the Server

- In the command line type `node server.js`. If you recieve an error try installing the dependencies using `npm ci` again.

# Required Operations

- A simple frontend was generated that utilizes each endpoint in order. The results of the endpoint are displayed at the bottom of the page.

1. Search Riders. This will allow you to browse all the riders or search for a specific one.

1. View Team Riders. Displays all the riders for a specific team utilizing a join.

1. Add Rider. POST's a new rider to the database.

1. Update Rider Age. Takes a rider's id and updates their age to number entered.

1. Team Summary. Shows a report of how many riders each team has.

1. Race Results. This is my custom operation that allows the user to view the race results of a selected id.

1. View All Events. Prints all the past and future events.

1. Event Vendors. Shows what vendors will be at what event.

1. Event Teams. Shows the teams signed up for an event.