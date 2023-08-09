
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
const mongoose = require('mongoose');
const session = require("express-session");
const multer = require('multer');
const upload = multer({ dest: "uploads/" });
const dataFilePathForTodo = './data.json';
const app = express();
const port = 8000;

const User = require("./models/user");
const Todo = require("./models/todo");

mongoose.connect("mongodb://127.0.0.1:27017/CQ-todo-app")
    .then(() => console.log("mongodb connected"))
    .catch ((err) => console.log("mongo error: " + err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));


// app.use(express.static(__dirname));
// The express.static middleware is serving the static files (such as index.html) from the root directory (__dirname) of your application. This means that any file present in the root directory can be accessed directly via its URL

app.set("view engine", "ejs")
app.set("views", path.resolve("./views")); // to tell where are our v

app.use(
    session({
        secret: "sahil@123",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // Set the maxAge to 1 day (in milliseconds)

    })
);


app.post('/photo', upload.single('picture'), (req, res) => {
    //console.log(req.file);
    res.send(req.file);
});
app.get('/', function (req, res) {
    if (!req.session.isLogginIn) {
        res.redirect("/login");
        return;
    }
    renderIndexPage(req, res);
});
app.get('/signup', function (req, res) {
    // res.sendFile(__dirname + "/views/signup.html")
    res.render("signup");
})
    .post('/signup', async function (req, res) {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const createdUser=await User.create({
            name,
            email,
            password,
        })
        console.log(createdUser);
        return res.status(201).json({ msg: "success" });
    });
app.get("/login", function (req, res) {
    res.render("login", { error: null });
})
    .post('/login', async function (req, res) {
        const email = req.body.email;
        const password = req.body.password;
        // console.log(email);
        const user = await User.findOne({ email, password })
        if (!user) return res.render('login', {
            LogInError: "invalid user name or password",
        })
                req.session.isLogginIn = true,
                req.session.email = email;
                req.session.name = user.name;
                res.redirect('/');      
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
app.get('/todos',async (req, res) => {
    const todos = await Todo.find({});
    res.json(todos);
})

// Modify the POST /todos route to handle both text and picture data
app.post('/todos', upload.single('picture'), async (req, res) => {
    const todoText = req.body.text;
    const todoPicture = req.file; // The uploaded image file

    // Handle the TODO creation and saving here
    // ...

    // Respond with the newly created TODO object
    const newTodo = await Todo.create({
        text: todoText,
        id: uuidv4(),
        picture: todoPicture ? todoPicture.filename : null,
    });
    res.json(newTodo);
});

app.put('/todos/:id', async (req, res) => {
    const id = req.params.id;
    const updatedTodo = req.body;

    try {
        const todo = await Todo.findByIdAndUpdate(id, updatedTodo, { new: true });
        if (todo) {
            res.json(todo);
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    } catch (error) {
        res.status(500).send("Error updating todo");
    }
});


app.delete('/todos/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (deletedTodo) {
            res.sendStatus(204);
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function renderIndexPage(req, res) {
    const todos = await Todo.find({});
    res.render("index", {
        name: req.session.name,
        todos: todos
    });
}