
// Build a To Do app and fulfill the below User stories.

// User story 1 : Your page should be divided in two parts.
// The left pane contains a list of tasks which 'll be fetched from the server. The right pane, by default contains a task form.

// User Story 2 : When the task form in the right pane is submitted, add a task to the server as well as in left pane with an options to mark the task as completed or delete the task from the list.
// User Story 3 : Whenever you mark the checkbox, update the status of the task to completed at server.In the above screenshot First & Third Task mark as completed.

// User Story 4 : When you click on the cross icon, delete that task from the left pane as well as from the server.Refer the below screenshot where Second Task is removed after click on the cross icon.
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const port = 8000;

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));


const dataFilePath = './data.json';

function readDataFile() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return [];
    }
}

// Update the writeDataFile function
function writeDataFile(data) {
    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing data file:', err);
        } else {
            console.log('Data file updated successfully.');
        }
    });
}


app.get('/todos', (req, res) => {
    const todos = readDataFile();
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const newTodo = req.body;
    newTodo.id = uuidv4();

    const todos = readDataFile();
    todos.push(newTodo);
    writeDataFile(todos);

    res.json(newTodo);
});

app.post('/todos', (req, res) => {
    const newTodo = req.body;
    newTodo.id = uuidv4();

    const todos = readDataFile();
    todos.push(newTodo);
    writeDataFile(todos);

    res.json(newTodo);
});


app.put('/todos/:id', (req, res) => {
    const id = req.params.id;
    const updatedTodo = req.body;

    const todos = readDataFile();
    const index = todos.findIndex(todo => todo.id === id);

    if (index !== -1) {
        todos[index] = { ...todos[index], ...updatedTodo };
        writeDataFile(todos);
        res.json(todos[index]);
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    const todos = readDataFile();
    const updatedTodos = todos.filter(todo => todo.id !== id);

    if (todos.length !== updatedTodos.length) {
        writeDataFile(updatedTodos);
        res.sendStatus(204);
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});