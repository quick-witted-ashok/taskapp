const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('Server running on port 3000'));

const fs = require('fs');
let currentUser = null; // Temporarily storing the logged-in user

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Simple input validation
    if (!username || !email || !password) {
        return res.status(400).send('All fields are required.');
    }

    // Load existing users from a JSON file
    let users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

    // Check if the user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).send('User already registered.');
    }

    // Save the new user
    users.push({ username, email, password });
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.status(200).send('Registration Successful');
});






// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    let users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password. Please try again.' }); // Respond with error
    }

    // Log in the user
    currentUser = user; // Assuming currentUser is defined somewhere to keep track of logged-in user
    res.status(200).json({ message: 'Login successful!' }); // Respond with success
});




// Route to get user data (profile/tasks page access)
app.get('/getUserData', checkLoggedIn, (req, res) => {
    if (currentUser) {
        res.json(currentUser);
    } else {
        res.status(401).send('No user logged in.');
    }
});

// Update Tasks Route
app.post('/updateTasks', checkLoggedIn, (req, res) => {
    const { email, tasks } = req.body;
    let users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
        users[userIndex].tasks = tasks;
        fs.writeFileSync('users.json', JSON.stringify(users));
        res.status(200).send('Tasks updated successfully');
    } else {
        res.status(404).send('User not found');
    }
});




// // Middleware to check if user is logged in
// function isLoggedIn(req, res, next) {
//     if (req.session.user) {
//         next(); // User is logged in, proceed to profile page
//     } else {
//         res.redirect('/login.html'); // Redirect to login if not logged in
//     }
// }

// // Protecting the profile page
// app.get('/profile.html', isLoggedIn, (req, res) => {
//     res.sendFile(__dirname + '/profile.html'); // Serve profile page only if logged in
// });

// Logout route
app.post('/logout', (req, res) => {
    currentUser = null; // Clear session on logout
    res.redirect('/login.html'); // Redirect to login page
});




// Middleware to check if the user is logged in
function checkLoggedIn(req, res, next) {
    if (!currentUser) {
        return res.redirect('/login.html');
    }
    next();
}

// Middleware for user registration page
function checkRegistered(req, res, next) {
    if (!currentUser) {
        return res.redirect('/register.html');
    }
    next();
}