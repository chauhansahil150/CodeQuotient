
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
const path = require('path');
// const { Session } = require('inspector');
const session = require("express-session");
const dataFilePathForTodo = './data.json';
const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(__dirname));
// The express.static middleware is serving the static files (such as index.html) from the root directory (__dirname) of your application. This means that any file present in the root directory can be accessed directly via its URL

app.set("view engine", "ejs")
app.set("views", path.resolve("./views")); // to tell where are our v

app.use(
    session({
        secret: "sahil@123",
        resave: false,
        saveUninitialized: true,
    })
);


function readDataFile(dataFilePath) {
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
    fs.writeFile(dataFilePathForTodo, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing data file:', err);
        } else {
            console.log('Data file updated successfully.');
        }
    });
}
app.get('/', function (req, res) {
    if (!req.session.isLogginIn) {
        res.redirect("/login");
        return;
    }
    const todos = readDataFile(dataFilePathForTodo);
    res.render("index", {
        name: req.session.name,
        todos:todos
    })
});
app.get('/signup', function (req, res) {
    // res.sendFile(__dirname + "/views/signup.html")
    res.render("signup");
})
    .post('/signup', function (req, res) {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        getAllUsers(function (err, data) {
            if (err) {
                res.end("something went wrong");
                return;
            }
            const user = data.find(function (user) {
                return user.email === email && user.password === password;
            });

            if (user) {
                res.end("Already have an account");
                return;
            }
            const Newuser = {
                name: name,
                email: email,
                password: password,
            };

            saveUser(Newuser, function (err) {
                if (err) {
                    res.end("something went wrong");
                    return;
                }
                res.redirect("/login");
            });
        });
        
    });
app.get("/login", function (req, res) {
    res.render("login", { error: null });
})
    .post('/login', function (req, res) {
        const email = req.body.email;
        const password = req.body.password;
        // console.log(email);

        getAllUsers(function (err, data) {
            if (err) {
                res.render("login", { error: "somthing went wrong" });
                return;
            }
            const user = data.find(function (user) {
                return user.email === email && user.password === password;
            });

            if (user) {
                req.session.isLogginIn = true,
                req.session.email = email;
                req.session.name = user.name;
                res.redirect('/');
                return;
            }
            // res.render("login", { error: "Invalid username or password" });
            res.end("Inavlid username or password")
        });
    });
app.get('/logout', (req, res) => {
    req.session.isLogginIn = false;
    res.redirect('/login');

})
app.get('/about', (req, res) => {
    // res.sendFile(__dirname + "/views/about.html");
    res.render("about", {
        name:req.session.name,
    });
});
app.get('/todos', (req, res) => {
    const todos = readDataFile(dataFilePathForTodo);
    res.json(todos);
})
.post('/todos', (req, res) => {
    const newTodo = req.body;
    newTodo.id = uuidv4();

    const todos = readDataFile(dataFilePathForTodo);
    todos.push(newTodo);
    writeDataFile(todos);

    res.json(newTodo);
});

app.put('/todos/:id', (req, res) => {
    const id = req.params.id;
    const updatedTodo = req.body;

    const todos = readDataFile(dataFilePathForTodo);
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

    const todos = readDataFile(dataFilePathForTodo);
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

function saveUser(user, callback) {
    getAllUsers(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        data.push(user);
        fs.writeFile("./users.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    });
}
function getAllUsers(callback) {
    fs.readFile("./users.json", "utf-8", function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.length === 0) {
            data = "[]";
        }
        try {
            data = JSON.parse(data);
            callback(null, data);
        } catch (err) {
            callback([]);
        }
    });
}