import { defineStore } from 'pinia'
export type Filter = 'all' | 'completed' | 'pending'
interface Todo {
  id: number
  title: string
  completed: boolean
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    filter:'all' as Filter
  }),

  getters: {
    totalTodos: (state) => state.todos.length,

    completedTodos: (state) => {
      return state.todos.filter(todo => todo.completed).length
    },

    pendingTodos: (state) => {
      return state.todos.filter(todo => !todo.completed).length
    },

    filteredTodos: (state) => {
      if (state.filter === 'completed') {
        return state.todos.filter(todo => todo.completed)
      }

      if (state.filter === 'pending') {
        return state.todos.filter(todo => !todo.completed)
      }

      return state.todos
    }
  },

  actions: {
    addTodo(title: string) {
      if (!title.trim()) {
        return
      }

      this.todos.push({
        id: Date.now(),
        title: title.trim(),
        completed: false
      })

      this.saveTodos()
    },

    toggleTodo(id: number) {
      const todo = this.todos.find(todo => todo.id === id)

      if (todo) {
        todo.completed = !todo.completed
        this.saveTodos()
      }
    },

    deleteTodo(id: number) {
      this.todos = this.todos.filter(todo => todo.id !== id)
      this.saveTodos()
    },

    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
      this.saveTodos()
    },

     setFilter(filter: Filter) {
      this.filter = filter
      this.saveTodos()
    },

    saveTodos() {
      localStorage.setItem('todos', JSON.stringify(this.todos))
    },

    loadTodos() {
      const todos = localStorage.getItem('todos')
      if (todos) {
        this.todos = JSON.parse(todos)
      }
    }
  }
})