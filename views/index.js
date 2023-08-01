
            // Add your JavaScript code here
    const todoForm = document.getElementById('todoForm');
    const todoText = document.getElementById('todoText');
    const todoList = document.getElementById('todoList');
    const picture=document.getElementById('picture');
    function fetchTodos() {
        fetch('/todos')
            .then(response => response.json())
            .then(todos => displayTodos(todos))
            .catch(error => console.error('Error fetching todos:', error));
                }


    async function completedTodo(todoid) {
                const spanElement = await document.getElementById(todoid);
    if (spanElement) {
        spanElement.style.textDecoration = spanElement.style.textDecoration === "line-through" ? "none" : "line-through";
                }

            }
    // JavaScript code to add a new TODO with text and picture
async function addTodo() {
    const todoText = document.getElementById('todoText').value.trim();
    const todoPictureInput = document.getElementById('picture');
    const todoPicture = todoPictureInput.files[0];

    if (todoText === '' || !todoPicture) return;

    const formData = new FormData();
    formData.append('text', todoText);
    formData.append('picture', todoPicture);

    try {
        const response = await fetch('/todos', {
            method: 'POST',
            body: formData,
        });

        const newTodo = await response.json();
        todoText.value = '';
        displayNewTodo(newTodo); // Call the modified function to display the new TODO item
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

    // Modify the displayTodos function to show images (if available) for each task
    // <!-- Modify the displayTodos function to show images (if available) for each task -->
    function displayTodos(todos) {
        const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

        todos.forEach(todo => {
            const li = document.createElement('li');
    const span = document.createElement('span');
    const image = document.createElement('img');
    const div = document.createElement('div');

    span.textContent = todo.text;
    image.src = todo.picture ? `/uploads/${todo.picture}` : 'placeholder.png';
    image.alt = 'Todo Image';
    div.innerHTML = `
    <button onclick="editTodo('${todo.id}')">Edit</button>
    <input type="checkbox" id="${todo.id}" class="strikethrough" onclick="completedTodo('${todo.id}')">
        <button onclick="deleteTodo('${todo.id}')">&times;</button>
        `;

        li.appendChild(image);
        li.appendChild(span);
        li.appendChild(div);

        todoList.appendChild(li);
        });
    }
        function displayNewTodo(todo) {
    const todoList = document.getElementById('todoList');
        const li = document.createElement('li');
        const span = document.createElement('span');
        const image = document.createElement('img');
        const div = document.createElement('div');

        span.textContent = todo.text;
        image.src = todo.picture ? `/uploads/${todo.picture}` : 'placeholder.png';
        image.alt = 'Todo Image';
        div.innerHTML = `
        <button onclick="editTodo('${todo.id}')">Edit</button>
        <input type="checkbox" id="${todo.id}" class="strikethrough" onclick="completedTodo('${todo.id}')">
            <button onclick="deleteTodo('${todo.id}')">&times;</button>
            `;

            li.appendChild(image);
            li.appendChild(span);
            li.appendChild(div);

            todoList.appendChild(li);
}

            // The rest of the JavaScript code remains the same.





            async function editTodo(id) {
                const newText = prompt('Enter the updated text:');
            if (newText === null || newText.trim() === '') return;

            try {
                    const response = await fetch(`/todos/${id}`, {
                method: 'PUT',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({text: newText }),
                    });

            const updatedTodo = await response.json();
            fetchTodos();
                } catch (error) {
                console.error('Error editing todo:', error);
                }
            }

            async function deleteTodo(id) {
                try {
                await fetch(`/todos/${id}`, { method: 'DELETE' });
            fetchTodos();
                } catch (error) {
                console.error('Error deleting todo:', error);
                }
            }

            todoForm.addEventListener('submit', event => {
                // event.preventDefault();
                addTodo();
            });
            fetchTodos();
        