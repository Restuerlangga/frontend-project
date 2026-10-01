<template>
  <div>
    <nav class="flex gap-4 bg-gray-800 px-6 py-4">
      <NuxtLink
        to="/"
        class="text-white hover:text-blue-300"
      >
        Todo
      </NuxtLink>

      <NuxtLink
        to="/github"
        class="text-white hover:text-blue-300"
      >
        GitHub Search
      </NuxtLink>
    </nav>

    <NuxtPage />
  </div>
</template> 