const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Mock database to store users and exercises
let users = [];
let exercises = [];

// Middleware to validate user ID
function validateUserId(req, res, next) {
  const userId = req.params._id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  // Check if user exists
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  req.user = user;
  next();
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const newUser = { username, _id: Date.now().toString() };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercises for a user
app.post('/api/users/:_id/exercises', validateUserId, (req, res) => {
  const { description, duration, date } = req.body;
  const { user } = req;

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: user._id
  };
  exercises.push(newExercise);
  res.json(newExercise);
});

// Get exercise log of a user
app.get('/api/users/:_id/logs', validateUserId, (req, res) => {
  const { user } = req;
  let log = exercises.filter(exercise => exercise._id === user._id);

  // Filter by date if from and to parameters are provided
  const { from, to, limit } = req.query;
  if (from) {
    log = log.filter(exercise => new Date(exercise.date) >= new Date(from));
  }
  if (to) {
    log = log.filter(exercise => new Date(exercise.date) <= new Date(to));
  }
  // Limit the number of logs if limit is provided
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const count = log.length;
  const userLog = { username: user.username, count, _id: user._id, log };
  res.json(userLog);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
