<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../../stores/todo'

const todoStore = useTodoStore()

onMounted(() => {
  todoStore.loadTodos()
})

const newTodoTitle = ref('')
const filters = [
  { key: 'all', label: 'Semua' },
  { key: 'completed', label: 'Selesai' },
  { key: 'pending', label: 'Aktif' }
]

function addTodo() {
  if (newTodoTitle.value.trim() !== '') {
    todoStore.addTodo(newTodoTitle.value)
    newTodoTitle.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 px-4 py-10">
    <div class="mx-auto max-w-2xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Todo List</h1>
        <p class="text-gray-600">Manage your tasks efficiently</p>
      </div>


      <form class="mb-6 flex gap-3" @submit.prevent="addTodo">
        <input
          v-model="newTodoTitle"
          type="text"
          placeholder="Add a new task"
          class="flex-1 rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
        <button
          type="submit"
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
        >
          Add Task
        </button>
      </form>

      <div class="mb-6 flex items-center gap-2">
     <button
      v-for="filter in [
      { key: 'all', label: 'Semua' },
      { key: 'pending', label: 'Belum Selesai' },
      { key: 'completed', label: 'Selesai' }
     ]"
      :key="filter.key"
      class="rounded-full px-4 py-2 text-sm"
      :class="
      todoStore.filter === filter.key
      ? 'bg-blue-500 text-white'
      : 'bg-white text-gray-600 hover:bg-gray-200'
    "
    @click="todoStore.setFilter(filter.key)"
  >
    {{ filter.label }}
  </button>
</div>

      <div class="mb-6 grid grid-cols-3 gap-3">
        <div class="rounded bg-white p-4 shadow">
          <h2 class="text-lg font-semibold text-gray-800">Total Tasks</h2>
          <p class="text-2xl font-bold text-gray-900">{{ todoStore.totalTodos }}</p>
        </div>

        <div class="rounded bg-white p-4 shadow">
          <h2 class="text-lg font-semibold text-gray-800">Completed Tasks</h2>
          <p class="text-2xl font-bold text-gray-900">{{ todoStore.completedTodos }}</p>
        </div>

        <div class="rounded bg-white p-4 shadow">
          <h2 class="text-lg font-semibold text-gray-800">Pending Tasks</h2>
          <p class="text-2xl font-bold text-gray-900">{{ todoStore.pendingTodos }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="todo in todoStore.filteredTodos"
          :key="todo.id"
          class="flex items-center justify-between rounded bg-white p-4 shadow"
        >
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
             :checked="todo.completed"
              class="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring focus:ring-blue-200"
              @change="todoStore.toggleTodo(todo.id)"
            />
            <span :class="{ 'line-through text-gray-400': todo.completed }">{{ todo.title }}</span>
          </div>
          <button
            @click="todoStore.deleteTodo(todo.id)"
            class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-200"
          >
            Delete
          </button>
        </div>
        <div
        v-if="todoStore.todos.length === 0"
        class="rounded-lg bg-white py-10 text-center shadow-sm"
      >
        <p class="text-gray-500">
          Belum ada TODO.
        </p>
      </div>

      <!-- Clear Completed -->
      <div
        v-if="todoStore.completedTodos > 0"
        class="mt-6 text-right"
      >
        <button
          class="text-sm text-gray-500 hover:text-gray-800"
          @click="todoStore.clearCompleted"
        >
          Hapus yang sudah selesai
        </button>
      </div>
      </div>
    </div>
  </div>
</template>
