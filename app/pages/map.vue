<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import { useGeoStore } from '../../stores/geo'

const geoStore = useGeoStore()

const mapElement = ref<HTMLDivElement | null>(null)

const latitude = ref(-6.9147)
const longitude = ref(107.6098)
const radius = ref(500)

let map: any = null
let marker: any = null
let geofenceCircle: any = null
let L: any = null
let routeLayer: any = null
let destinationMarker: any = null

// Memindahkan marker dan geofence
function updateLocation(
  lat: number,
  lon: number,
  zoom = 16
) {
  const position: [number, number] = [lat, lon]

  latitude.value = lat
  longitude.value = lon

  if (marker) {
    marker.setLatLng(position)
  }

  if (geofenceCircle) {
    geofenceCircle.setLatLng(position)
  }

  if (map) {
    map.setView(position, zoom)
  }
}

// Ketika user memilih hasil Geo Search
async function selectLocation(result: any) {
  const destinationLat = Number(result.lat)
  const destinationLon = Number(result.lon)

  // Origin = posisi marker/geofence saat ini
  const originLat = latitude.value
  const originLon = longitude.value

  console.log('Origin:', originLat, originLon)
  console.log('Destination:', destinationLat, destinationLon)

  // Hapus marker tujuan sebelumnya
  if (destinationMarker) {
    destinationMarker.remove()
  }

  // Buat marker tujuan
  if (L && map) {
    destinationMarker = L.marker([
      destinationLat,
      destinationLon
    ])
      .addTo(map)
      .bindPopup(result.display_name)
      .openPopup()
  }

  // Ambil rute
  await geoStore.getRoute(
    originLat,
    originLon,
    destinationLat,
    destinationLon
  )

  // Gambar rute
  drawRoute()
}

function drawRoute() {
  if (!map || !L || !geoStore.route) return

  const route = geoStore.route

  // Hapus route sebelumnya
  if (routeLayer) {
    map.removeLayer(routeLayer)
    routeLayer = null
  }

  // OSRM: [longitude, latitude]
  // Leaflet: [latitude, longitude]
  const coordinates = route.geometry.coordinates.map(
    (coord: [number, number]) => [
      coord[1],
      coord[0]
    ]
  )

  // Buat SATU route saja
  routeLayer = L.polyline(coordinates, {
    color: 'blue',
    weight: 5,
    opacity: 0.8
  }).addTo(map)

  // Fokus ke route terbaru
  map.fitBounds(routeLayer.getBounds(), {
    padding: [50, 50]
  })
}
function formatDistance(distance: number) {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`
  }

  return `${Math.round(distance)} m`
}

function formatDuration(duration: number) {
  const minutes = Math.ceil(duration / 60)

  if (minutes < 60) {
    return `${minutes} menit`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} jam`
  }

  return `${hours} jam ${remainingMinutes} menit`
}




// Reset ke lokasi awal
function resetLocation() {
  const lat = -6.9147
  const lon = 107.6098

  radius.value = 500

  updateLocation(lat, lon, 15)

  geoStore.route = null

  if (routeLayer) {
    routeLayer.remove()
    routeLayer = null
  }

  if (destinationMarker) {
    destinationMarker.remove()
    destinationMarker = null
  }

  if (marker) {
    marker
      .bindPopup('Lokasi Awal')
      .openPopup()
  }
}

// Inisialisasi Leaflet
onMounted(async () => {
  if (!mapElement.value) return

  const leafletModule = await import('leaflet')
  L = leafletModule.default

  // Membuat map
  map = L.map(mapElement.value).setView(
    [latitude.value, longitude.value],
    15
  )

  // OpenStreetMap sebagai peta dasar
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  ).addTo(map)

  // Marker
  marker = L.marker([
    latitude.value,
    longitude.value
  ]).addTo(map)

  marker
    .bindPopup('Lokasi Awal')
    .openPopup()

  // Geofence
  geofenceCircle = L.circle(
    [latitude.value, longitude.value],
    {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.2,
      radius: radius.value
    }
  ).addTo(map)

  // Klik map
  map.on('click', (event: any) => {
    const lat = event.latlng.lat
    const lon = event.latlng.lng

    updateLocation(lat, lon)

    if (marker) {
      marker
        .bindPopup('Pusat Geofence')
        .openPopup()
    }
  })

  // Memastikan ukuran map benar
  setTimeout(() => {
    map?.invalidateSize()
  }, 100)
})

// Mengubah ukuran geofence ketika slider berubah
watch(radius, (newRadius) => {
  if (geofenceCircle && newRadius > 0) {
    geofenceCircle.setRadius(newRadius)
  }
})

// Membersihkan map ketika pindah halaman
onBeforeUnmount(() => {

  if (routeLayer) {
    routeLayer.remove()
    routeLayer = null
  }

  if (map) {
    map.remove()
    map = null
  }
  
})
</script>

<template>
  <main class="min-h-screen bg-gray-100 px-4 py-8">
    <div class="mx-auto max-w-5xl">

      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">
          Leaflet Map
        </h1>

        <p class="mt-2 text-gray-600">
          Interactive map with Geo Search, marker, and geofence.
        </p>
      </header>


    
     

      <section class="mb-5 rounded-xl bg-white p-5 shadow">

        <h2 class="mb-3 text-lg font-bold text-gray-800">
          Search Location
        </h2>

        <div class="flex gap-2">

          <input
            v-model="geoStore.query"
            type="text"
            placeholder="Contoh: TransTRACK Bandung"
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            @keyup.enter="geoStore.searchLocation"
          />

          <button
            type="button"
            :disabled="geoStore.loading"
            @click="geoStore.searchLocation"
            class="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ geoStore.loading ? 'Searching...' : 'Search' }}
          </button>

        </div>


        <!-- Loading -->

        <p
          v-if="geoStore.loading"
          class="mt-3 text-sm text-gray-500"
        >
          Mencari lokasi...
        </p>


        <!-- Error -->

        <p
          v-if="geoStore.error"
          class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {{ geoStore.error }}
        </p>


        <!-- Search Results -->

        <div
          v-if="geoStore.results.length"
          class="mt-4 space-y-2"
        >

          <p class="mb-2 text-sm font-medium text-gray-700">
            Hasil pencarian:
          </p>

          <button
            v-for="result in geoStore.results"
            :key="`${result.lat}-${result.lon}`"
            type="button"
            @click="selectLocation(result)"
            class="block w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
          >

            <p class="font-medium text-gray-800">
              {{ result.display_name }}
            </p>

            <p class="mt-1 text-xs text-gray-500">
              Latitude: {{ result.lat }}
              <br>
              Longitude: {{ result.lon }}
            </p>

          </button>

        </div>

      </section>


      

      <section class="mb-5 rounded-xl bg-white p-5 shadow">

        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">

          <label
            for="radius"
            class="font-semibold text-gray-800"
          >
            Geofence Radius
          </label>

          <span
            class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
          >
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

          <span>
            100 m
          </span>

          <span>
            2.000 m
          </span>

        </div>

      </section>



      
      

      <section
        class="overflow-hidden rounded-xl bg-white shadow"
      >

        <div
          ref="mapElement"
          class="h-[450px] w-full"
        ></div>

      </section>

      <!-- Route Information -->
<section
  v-if="geoStore.route"
  class="mt-5 rounded-xl bg-white p-5 shadow"
>
  <h2 class="mb-4 text-lg font-bold text-gray-800">
    Route Information
  </h2>

  <div class="grid gap-4 sm:grid-cols-2">

    <!-- Distance -->
    <div class="rounded-xl bg-blue-50 p-4">
      <p class="text-sm text-gray-500">
        Jarak
      </p>

      <p class="mt-1 text-2xl font-bold text-gray-800">
        {{ formatDistance(geoStore.route.distance) }}
      </p>
    </div>

    <!-- ETA -->
    <div class="rounded-xl bg-green-50 p-4">
      <p class="text-sm text-gray-500">
        Estimasi Waktu
      </p>

      <p class="mt-1 text-2xl font-bold text-gray-800">
        {{ formatDuration(geoStore.route.duration) }}
      </p>
    </div>

  </div>
</section>


    

      <section class="mt-5 rounded-xl bg-white p-5 shadow">

        <div class="mb-4 flex items-center justify-between gap-3">

          <h2 class="text-lg font-bold text-gray-800">
            Location Details
          </h2>

          <button
            type="button"
            @click="resetLocation"
            class="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-700"
          >
            Reset
          </button>

        </div>


        <div class="grid gap-4 sm:grid-cols-3">

          <!-- Latitude -->

          <div class="rounded-lg bg-gray-50 p-4">

            <p class="text-sm text-gray-500">
              Latitude
            </p>

            <p class="mt-1 break-all font-semibold text-gray-800">
              {{ latitude.toFixed(6) }}
            </p>

          </div>


          <!-- Longitude -->

          <div class="rounded-lg bg-gray-50 p-4">

            <p class="text-sm text-gray-500">
              Longitude
            </p>

            <p class="mt-1 break-all font-semibold text-gray-800">
              {{ longitude.toFixed(6) }}
            </p>

          </div>


          <!-- Radius -->

          <div class="rounded-lg bg-gray-50 p-4">

            <p class="text-sm text-gray-500">
              Radius
            </p>

            <p class="mt-1 font-semibold text-gray-800">
              {{ radius }} meter
            </p>

          </div>

        </div>


        <p class="mt-4 text-sm text-gray-500">
          Klik lokasi lain pada peta untuk memindahkan marker
          dan pusat geofence. Gunakan pencarian untuk menemukan
          lokasi melalui Geo Search.
        </p>

      </section>

    </div>
  </main>
</template>