<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const githubUser = ref<any>(null)
const loading = ref(false)
const error = ref('')

async function searchGithubUser() {
  if (!username.value.trim()) {
    error.value = 'Username tidak boleh kosong'
    return
  }

  loading.value = true
  error.value = ''
  githubUser.value = null

  try {
    const response = await fetch(
      `https://api.github.com/users/${username.value.trim()}`
    )

    if (!response.ok) {
      throw new Error('User tidak ditemukan')
    }

    githubUser.value = await response.json()
  } catch (err) {
    error.value = 'User GitHub tidak ditemukan'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 px-4 py-10">
    <div class="mx-auto max-w-2xl">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          GitHub User Search
        </h1>

        <p class="mt-2 text-gray-600">
          Cari informasi pengguna GitHub berdasarkan username.
        </p>
      </div>

      <form
        class="mb-6 flex gap-3"
        @submit.prevent="searchGithubUser"
      >
        <input
          v-model="username"
          type="text"
          placeholder="Masukkan username GitHub"
          class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <button
          type="submit"
          :disabled="loading"
          class="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? 'Mencari...' : 'Cari' }}
        </button>
      </form>

      <p
        v-if="error"
        class="mb-6 rounded-lg bg-red-100 p-4 text-red-600"
      >
        {{ error }}
      </p>

      <div
        v-if="githubUser"
        class="rounded-lg bg-white p-6 shadow"
      >
        <div class="flex items-start gap-5">

          <img
            :src="githubUser.avatar_url"
            :alt="githubUser.login"
            class="h-24 w-24 rounded-full"
          />

          <div>
            <h2 class="text-2xl font-bold text-gray-800">
              {{ githubUser.name || githubUser.login }}
            </h2>

            <p class="text-gray-500">
              @{{ githubUser.login }}
            </p>

            <p
              v-if="githubUser.bio"
              class="mt-3 text-gray-600"
            >
              {{ githubUser.bio }}
            </p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-3 gap-3">

          <div class="rounded-lg bg-gray-100 p-4 text-center">
            <p class="text-2xl font-bold">
              {{ githubUser.followers }}
            </p>
            <p class="text-sm text-gray-500">
              Followers
            </p>
          </div>

          <div class="rounded-lg bg-gray-100 p-4 text-center">
            <p class="text-2xl font-bold">
              {{ githubUser.following }}
            </p>
            <p class="text-sm text-gray-500">
              Following
            </p>
          </div>

          <div class="rounded-lg bg-gray-100 p-4 text-center">
            <p class="text-2xl font-bold">
              {{ githubUser.public_repos }}
            </p>
            <p class="text-sm text-gray-500">
              Repositories
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>