// backend/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3015;

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
app.post('/api/goals', (req, res) => {
  const { name, notes, orderNumber } = req.body;

  if (!name || !orderNumber) {
    return res.status(400).json({ error: 'Name and order number are required' });
  }

  db.run(
    'INSERT INTO goals (name, notes, orderNumber) VALUES (?, ?, ?)',
    [name, notes, orderNumber],
    (err) => {
      if (err) {
        console.error('Error inserting goal:', err.message);
        res.status(500).json({ error: 'Failed to add the goal' });
      } else {
        res.json({ message: 'Goal added successfully' });
      }
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

// API route to update main notes
app.put('/api/notes', (req, res) => {
  const { mainNotes } = req.body;

  db.run('UPDATE mainNotes SET notes = ?', [mainNotes], (err) => {
    if (err) {
      console.error('Error updating main notes:', err.message);
      res.status(500).json({ error: 'Failed to update main notes' });
    } else {
      res.json({ message: 'Main notes updated successfully' });
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
