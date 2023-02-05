const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({ error: 'Username not found!' });
  }

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {

  const {
    name,
    username
  } = request.body;

  try {

    const userExists = users.some(user => user.username === username);

    if(userExists) {
      return response.status(400).json({ error: 'User already exists!' });
    }

    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(newUser);
  
    return response.status(201).json(newUser)

  } catch(e) {

    return response.status(400).json({ error: "Error in request"});

  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const {
    user
  } = request;

  try {

    return response.status(200).json(user.todos);

  } catch(e) {
    return response.status(400).json({ error: 'Error in request' });
  }

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    title,
    deadline
  } = request.body;

  const {
    user
  } = request;

  try {

    const newTodo = { 
      id: uuidv4(),
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
    }

    user.todos.push(newTodo)

    return response.status(201).json(newTodo)

  } catch(e) {
    return response.status(400).json({ error: 'Error in request' });
  }
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {
    title,
    deadline
  } = request.body;

  const {
    id
  } = request.params

  const {
    user
  } = request;

  try {

    const index = user.todos.findIndex(todo => {
      return todo.id === id
    });

    if(index === -1) {
      return response.status(404).json({ error: 'Not found todo!'})
    }

    user.todos[index].title = title;
    user.todos[index].deadline = new Date(deadline);

    return response.status(200).json(user.todos[index]);

  } catch(e) {
    return response.status(400).json({ error: 'Error in request' });
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {
    id
  } = request.params

  const {
    user
  } = request;

  try {

    const index = user.todos.findIndex(todo => {
      return todo.id === id
    });

    if(index === -1) {
      return response.status(404).json({ error: 'Not found todo!'})
    }

    user.todos[index].done = true;

    return response.status(200).json(user.todos[index]);

  } catch(e) {
    return response.status(400).json({ error: 'Error in request' });
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    id
  } = request.params

  const {
    user
  } = request;

  try {

    const index = user.todos.findIndex(todo => {
      return todo.id === id
    });

    if(index === -1) {
      return response.status(404).json({ error: 'Not found todo!'})
    }

    user.todos.splice(index, 1);

    return response.status(204).send();

  } catch(e) {
    return response.status(400).json({ error: 'Error in request' });
  }

});

module.exports = app;