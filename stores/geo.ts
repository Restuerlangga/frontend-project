import { defineStore } from 'pinia'

interface GeoResult {
  lat: string
  lon: string
  displayName: string
}

export const useGeoStore = defineStore('geo', {
  state: () => ({
    query: '',
    results: [] as GeoResult[],
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

    clearResults() {
      this.results = []
      this.error = ''
    }
  }
})