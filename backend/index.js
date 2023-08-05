// backend/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();

const port = 3015;

app.use(cors()); 
// Create a new SQLite database instance
const db = new sqlite3.Database('./goals.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the database.');
    // Create the goals table if it doesn't exist
    db.run(
      'CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, notes TEXT, orderNumber INTEGER)',
      (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        } else {
          console.log('Table "goals" created.');
        }
      }
    );
  }
});

app.use(express.json());

// API route to add a new goal
// app.post('/api/goals', (req, res) => {
//   const { name, notes, orderNumber } = req.body;
//   console.log("req.body", req.body)
//   console.log("name", name, ",", "notes", notes, ",", "orderNumber", orderNumber);

//   if (!name ) {
//     return res.status(400).json({ error: 'Name required' });
//   }

//   db.run(
//     'INSERT INTO goals (name, notes, orderNumber) VALUES (?, ?, ?)',
//     [name, notes, orderNumber],
//     (err) => {
//       if (err) {
//         console.error('Error inserting goal:', err.message);
//         res.status(500).json({ error: 'Failed to add the goal' });
//       } else {
//         res.json({ message: 'Goal added successfully' });
//       }
//     }
//   );
// });

app.post('/api/goals', (req, res) => {
  const { name, notes, orderNumber } = req.body;
  console.log("req.body", req.body);
  console.log("name", name, ",", "notes", notes, ",", "orderNumber", orderNumber);

  if (!name) {
    return res.status(400).json({ error: 'Name required' });
  }

  db.run(
    'INSERT INTO goals (name, notes, orderNumber) VALUES (?, ?, ?)',
    [name, notes, orderNumber],
    function (err) {
      if (err) {
        console.error('Error inserting goal:', err.message);
        return res.status(500).json({ error: 'Failed to add the goal' });
      }

      const insertedGoalId = this.lastID;

      db.get(
        'SELECT * FROM goals WHERE id = ?',
        [insertedGoalId],
        (err, row) => {
          if (err) {
            console.error('Error fetching the inserted goal:', err.message);
            return res.status(500).json({ error: 'Failed to fetch the inserted goal' });
          }

          if (!row) {
            return res.status(404).json({ error: 'Inserted goal not found' });
          }

          res.json(row);
        }
      );
    }
  );
});


// API route to delete a goal
app.delete('/api/goals/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM goals WHERE id = ?', id, (err) => {
    if (err) {
      console.error('Error deleting goal:', err.message);
      res.status(500).json({ error: 'Failed to delete the goal' });
    } else {
      res.json({ message: 'Goal deleted successfully' });
    }
  });
});

// API update  goal check or uncheck status
// add done column to goals table
app.put('/api/goals/:id/toggledone', (req, res) => {
  const id = req.params.id;
   db.serialize(() => {
    // Fetch the goal by id
    db.get('SELECT * FROM goals WHERE id = ?', id, (err, row) => {
      if (err) {
        console.error('Error fetching goal:', err);
        res.status(500).json({ error: 'Failed to update goal done' });
      } else if (!row) {
        console.log('Goal not found');
        res.status(500).json({ error: 'Goal not found' });
      } else {
        console.log('Fetched goal:', row);

        // Update the "done" value
        const newDoneValue = row.done === 1 ? 0 : 1;
        db.run('UPDATE goals SET done = ? WHERE id = ?', [newDoneValue, id], (updateErr) => {
          if (updateErr) {
            console.error('Error updating goal:', updateErr);
            res.status(500).json({ error: 'Failed to update goal done' });
          } else {
            console.log('Updated "done" value successfully.');
            res.json({ message: 'Goal done updated successfully' });
          }
        });
      }
    });
  });
});

// API route to update goal orderNumber
app.put('/api/goals/:id/orderNumber', (req, res) => {
  const id = req.params.id;
  const { orderNumber } = req.body;
  // update in db  
  db.run('UPDATE goals SET orderNumber = ? WHERE id = ?', [orderNumber, id], (err) => {
    if (err) {
      console.error('Error updating goal orderNumber:', err.message);
      res.status(500).json({ error: 'Failed to update goal orderNumber' });
    } else {
      res.json({ message: 'Goal orderNumber updated successfully' });
    }
  });
});

// API route to update goal notes
app.put('/api/goals/:id/notes', (req, res) => {
  const id = req.params.id;
  const { notes } = req.body;

  db.run('UPDATE goals SET notes = ? WHERE id = ?', [notes, id], (err) => {
    if (err) {
      console.error('Error updating goal notes:', err.message);
      res.status(500).json({ error: 'Failed to update goal notes' });
    } else {
      res.json({ message: 'Goal notes updated successfully' });
    }
  });
});

// API route to get main notes
// TODO create mainNotes table
app.get('/api/notes', (req, res) => {
  db.get('SELECT * FROM notes', (err, row) => {
    if (err) {
      console.error('Error fetching main notes:', err.message);
      res.status(500).json({ error: 'Failed to fetch main notes' });
    } else {
      res.json(row);
    }
  });
});
// API route to update main notes
app.put('/api/notes', (req, res) => {
  const { text } = req.body;

  // Check if any row exists in the "notes" table
  db.get('SELECT * FROM notes LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error fetching notes:', err.message);
      res.status(500).json({ error: 'Failed to fetch notes' });
    } else {
      // If the row does not exist, insert a new row with the provided note
      if (!row) {
        db.run('INSERT INTO notes (text) VALUES (?)', [text], (insertErr) => {
          if (insertErr) {
            console.error('Error inserting note:', insertErr.message);
            res.status(500).json({ error: 'Failed to insert note' });
          } else {
            res.json({ message: 'New note added successfully' });
          }
        });
      } else {
        const existingId = row.id;
        // If the row exists, update the existing note with the provided one
        db.run('UPDATE notes SET text = ? WHERE id = ?', [text, existingId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating note:', updateErr.message);
            res.status(500).json({ error: 'Failed to update note' });
          } else {
            res.json({ message: 'Note updated successfully' });
          }
        });
      }
    }
  });
});


// API route to update goal order
app.put('/api/goals', (req, res) => {
  const { goals } = req.body;

  if (!Array.isArray(goals)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Use a transaction for better performance and atomicity
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    goals.forEach((goal, index) => {
      db.run('UPDATE goals SET orderNumber = ? WHERE id = ?', [index, goal.id]);
    });

    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error updating goal order:', err.message);
        res.status(500).json({ error: 'Failed to update goal order' });
      } else {
        res.json({ message: 'Goal order updated successfully' });
      }
    });
  });
});

// API route to get all goals
app.get('/api/goals', (req, res) => {
  db.all('SELECT * FROM goals ORDER BY orderNumber ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching goals:', err.message);
      res.status(500).json({ error: 'Failed to fetch goals' });
    } else {
      res.json(rows);
    }
  });
});

// Serve React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
