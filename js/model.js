export default class Model {
  constructor() {
    this.view = null;
    this.todos = [];
    this.baseUrl = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api'; // Cambiar por la URL real de Firebase
  }

  setView(view) {
    this.view = view;
  }

  async getTodos() {
    try {
      const response = await fetch(`${this.baseUrl}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      this.todos = await response.json();
      return this.todos.map((todo) => ({ ...todo }));
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  }

  findTodo(id) {
    return this.todos.findIndex((todo) => todo.id === id);
  }

  async toggleCompleted(id) {
    try {
      const index = this.findTodo(id);
      const todo = this.todos[index];
      const completed = !todo.completed;

      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo status');

      todo.completed = completed;
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  }

  async editTodo(id, values) {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to edit todo');

      const index = this.findTodo(id);
      Object.assign(this.todos[index], values);
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  }

  async addTodo(title, description) {
    try {
      const response = await fetch(`${this.baseUrl}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to add todo');

      const todo = await response.json();
      this.todos.push(todo);
      return { ...todo };
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  }

  async removeTodo(id) {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      const index = this.findTodo(id);
      this.todos.splice(index, 1);
    } catch (error) {
      console.error('Error removing todo:', error);
    }
  }
}

