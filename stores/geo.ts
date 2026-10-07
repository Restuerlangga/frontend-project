import { defineStore } from 'pinia'

interface GeoResult {
  lat: string
  lon: string
  display_name: string
}

interface Maneuver {
  type: string
  modifier?: string
  location: [number, number]
}

interface RouteStep {
  distance: number
  duration: number
  name: string
  maneuver: Maneuver
}

interface RouteLeg {
  steps: RouteStep[]
}

interface RouteResult {
  distance: number
  duration: number
  geometry: {
    coordinates: [number, number][]
    type: 'LineString'
  }
  legs: RouteLeg[]
}

export const useGeoStore = defineStore('geo', {
  state: () => ({
    query: '',
    results: [] as GeoResult[],
    route: null as RouteResult | null,
    loading: false,
    error: ''
  }),

  actions: {
    async searchLocation() {
      if (!this.query.trim()) {
        this.results = []
        this.error = 'Masukkan lokasi yang ingin dicari'
        return
      }

      this.loading = true
      this.error = ''
      this.results = []

      try {
        const params = new URLSearchParams({
          q: this.query.trim(),
          format: 'json',
          zoom: '18',
          addressdetails: '1'
        })

        const response = await fetch(
          `https://geo.transtrack.id/search?${params.toString()}`
        )

        if (!response.ok) {
          throw new Error('Gagal mengambil data dari Geo Search API')
        }

        const data = await response.json()

        this.results = data
      } catch (error) {
        console.error(error)
        this.error = 'Gagal mencari lokasi'
      } finally {
        this.loading = false
      }
    },

    async getRoute(
      originLat: number,
      originLon: number,
      destinationLat: number,
      destinationLon: number
    ) {
      try {
        this.error = ''

        const coordinates =
          `${originLon},${originLat};${destinationLon},${destinationLat}`

        console.log('OSRM Coordinates:', coordinates)

        const params = new URLSearchParams({
          geometries: 'geojson',
          alternatives: 'false',
          steps: 'true',
          generate_hints: 'false',
          overview: 'full'
        })

        const url =
          `https://osrm.transtrack.id/route/v1/driving/${coordinates}?${params.toString()}`

        console.log('OSRM URL:', url)

        const response = await fetch(url)

        console.log('OSRM response:', response.status)

        if (!response.ok) {
          throw new Error(
            'Gagal mengambil data rute dari OSRM API'
          )
        }

        const data = await response.json()

        if (
          data.code !== 'Ok' ||
          !data.routes ||
          !data.routes.length
        ) {
          throw new Error('Rute tidak ditemukan')
        }

        this.route = data.routes[0]

        console.log('OSRM Route Data:', this.route)

      } catch (error) {
        console.error('OSRM ERROR:', error)

        this.route = null

        if (error instanceof Error) {
          this.error = error.message
        } else {
          this.error = 'Gagal mengambil rute'
        }
      }
    },

    clearResults() {
      this.results = []
      this.error = ''
    }
  }
})