const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup to store user email during the session
app.use(session({
    secret: 'polling_secret_key',  // Use a strong secret for production
    resave: false,
    saveUninitialized: true
}));

// Poll data to store votes
let pollData = {
    option1: 0,
    option2: 0
};

// To track voters by email
let voterEmails = {};

// Serve static files like HTML, CSS, and JS
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to handle login and redirect to the poll page
app.post('/login', (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).send('Email is required!');
    }

    // Store the email in the session
    req.session.email = email;
    res.redirect('/poll');
});

// Route to render the poll page after login
app.get('/poll', (req, res) => {
    // Check if the user is logged in (i.e., email exists in session)
    if (!req.session.email) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'poll.html'));
});

// Route to get current poll results
app.get('/results', (req, res) => {
    res.json(pollData);
});

// Route to cast a vote for option 1
app.post('/vote/option1', (req, res) => {
    const email = req.session.email;

    if (!email) {
        return res.status(401).send('Please log in to vote.');
    }

    // Check if the email has already voted
    if (voterEmails[email]) {
        return res.status(403).send('You have already voted.');
    }

    // Vote for option 1
    pollData.option1++;
    voterEmails[email] = true;
    res.send('Thank you for voting for Option 1');
});

// Route to cast a vote for option 2
app.post('/vote/option2', (req, res) => {
    const email = req.session.email;

    if (!email) {
        return res.status(401).send('Please log in to vote.');
    }

    // Check if the email has already voted
    if (voterEmails[email]) {
        return res.status(403).send('You have already voted.');
    }

    // Vote for option 2
    pollData.option2++;
    voterEmails[email] = true;
    res.send('Thank you for voting for Option 2');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
