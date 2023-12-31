// backend/createDb.js
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database instance
const db = new sqlite3.Database('./goals.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the database.');
    // Create the goals table if it doesn't exist
    db.run(
      'CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, notes TEXT, orderNumber INTEGER, done integer default 0)',
      (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        } else {
          console.log('Table "goals" created.');

          // lets create notes table notes(id primary key auto increment, text text)

          db.run(
            'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT default "")',
            (err) => {
              if (err) {
                console.error('Error creating table notes:', err.message);
              } else {
                console.log('Table "notes" created.');
              }
            }
          );

        }
        // Close the database connection
        db.close();
      }
    );
  }
});
