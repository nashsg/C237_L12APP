// Import required modules
const express = require('express');

// Create an Express application
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static CSS styles from the public directory
app.use(express.static('public'));

// In-memory array to store tasks
let tasks = [];

// Dashboard Route
app.get('/', (req, res) => {
    const now = new Date();

    // Map tasks to calculate the 24-hour urgency flag dynamically
    const processedTasks = tasks.map(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Urgent if time remaining is 24 hours or less and status is Pending
        const isUrgent = hoursDiff <= 24 && task.status === "Pending";
        return { ...task, isUrgent };
    });

    const pending = processedTasks.filter(t => t.status === "Pending");
    const completed = processedTasks.filter(t => t.status === "Done");
    
    res.render('index', { pending, completed });
});

// Add Task Form
app.get('/add', (req, res) => res.render('add'));
app.post('/add', (req, res) => {
    const { moduleCode, taskName, dueDate } = req.body;
    tasks.push({ id: Date.now(), moduleCode, taskName, dueDate, status: "Pending" });
    res.redirect('/');
});

// Edit Task Form
app.get('/edit/:id', (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    res.render('edit', { task });
});
app.post('/edit/:id', (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    if (task) {
        task.moduleCode = req.body.moduleCode;
        task.taskName = req.body.taskName;
        task.dueDate = req.body.dueDate;
    }
    res.redirect('/');
});

// Toggle Completion Status
app.post('/toggle/:id', (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    if (task) {
        task.status = task.status === "Pending" ? "Done" : "Pending";
    }
    res.redirect('/');
});

// Delete Task
app.post('/delete/:id', (req, res) => {
    tasks = tasks.filter(t => t.id != req.params.id);
    res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});