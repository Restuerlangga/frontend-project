<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import 'leaflet/dist/leaflet.css'

const mapElement = ref<HTMLDivElement | null>(null)

const latitude = ref(-6.9147)
const longitude = ref(107.6098)
const radius = ref(500)

let map: any = null
let marker: any = null
let geofonceCircle: any = null
let L: any = null

const resetLocation = () => {
    const position: [number, number] = [-6.9147, 107.6098]

    latitude.value = position[0]
    longitude.value = position[1]
    radius.value = 500

    if (marker) {
        marker.setLatLng(position)
    }

    if (geofonceCircle) {
        geofonceCircle.setLatLng(position)
        geofonceCircle.setRadius(500)
    }

    if (map) {
        map.setView(position, 15)
    }
}

onMounted(async () => {
    if (!mapElement.value) return

    
    const leafletModule = await import('leaflet')
    L = leafletModule.default

   map = L.map(mapElement.value).setView(
    [latitude.value, longitude.value],
    15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map)

    marker = L.marker([latitude.value, longitude.value]).addTo(map)

    marker.bindPopup('Lokasi Anda').openPopup()

    geofonceCircle = L.circle([latitude.value, longitude.value], {
        color: 'blue',
        fillColor: '#blue',
        fillOpacity: 0.2,
        radius: radius.value
    }).addTo(map)

     // Klik peta untuk memindahkan marker dan pusat geofence
  map.on('click', (event: any) => {
    latitude.value = event.latlng.lat
    longitude.value = event.latlng.lng

    const position = event.latlng

    marker.setLatLng(position)
    geofonceCircle.setLatLng(position)

    marker
      .bindPopup('Pusat Geofence')
      .openPopup() 
    })

    setTimeout(() => {
        map.invalidateSize()
    }, 100)

    watch(radius, (newRadius) => {
        if (geofonceCircle && newRadius > 0) {
            geofonceCircle.setRadius(newRadius)
        }
    })

   function resetLocation() {
  const position: [number, number] = [-6.9147, 107.6098]

  latitude.value = position[0]
  longitude.value = position[1]
  radius.value = 500

  if (marker) {
    marker.setLatLng(position)
  }

  if (geofonceCircle) {
    geofonceCircle.setLatLng(position)
    geofonceCircle.setRadius(500)
  }

  if (map) {
    map.setView(position, 15)
  }
}

    onBeforeUnmount(() => {
        if (map) {
            map.remove()
        }
    })

    

})

</script>

<template>
  <main class="min-h-screen bg-gray-100 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">
          Leaflet Map
        </h1>
        <p class="mt-2 text-gray-600">
          Interactive map with marker and geofence.
        </p>
      </header>

      <section class="mb-5 rounded-xl bg-white p-5 shadow">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label for="radius" class="font-semibold text-gray-800">
            Geofence Radius
          </label>

          <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {{ radius }} meter
          </span>
        </div>

        <input
          id="radius"
          v-model.number="radius"
          type="range"
          min="100"
          max="2000"
          step="100"
          class="w-full cursor-pointer accent-blue-600"
        />

        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>100 m</span>
          <span>2.000 m</span>
        </div>
      </section>

      <section class="overflow-hidden rounded-xl bg-white shadow">
        <div
          ref="mapElement"
          class="h-[450px] w-full"
        ></div>
      </section>

      <section class="mt-5 rounded-xl bg-white p-5 shadow">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-gray-800">
            Location Details
          </h2>

            <button
            type="button"
            @click="resetLocation"
            class="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
>
            Reset
            </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg bg-gray-50 p-4">
            <p class="text-sm text-gray-500">Latitude</p>
            <p class="mt-1 break-all font-semibold">
              {{ latitude.toFixed(6) }}
            </p>
          </div>

          <div class="rounded-lg bg-gray-50 p-4">
            <p class="text-sm text-gray-500">Longitude</p>
            <p class="mt-1 break-all font-semibold">
              {{ longitude.toFixed(6) }}
            </p>
          </div>

          <div class="rounded-lg bg-gray-50 p-4">
            <p class="text-sm text-gray-500">Radius</p>
            <p class="mt-1 font-semibold">
              {{ radius }} meter
            </p>
          </div>
        </div>

        <p class="mt-4 text-sm text-gray-500">
          Klik lokasi lain pada peta untuk memindahkan marker
          dan pusat geofence. Geser slider untuk mengubah radius.
        </p>
      </section>
    </div>
  </main>
</template>