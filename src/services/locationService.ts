import axios from 'axios';

const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const BASE_URL = import.meta.env.VITE_LOCATIONIQ_BASE_URL;

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
}

export interface DistanceResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: string;
  }>;
}

export const locationService = {
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    if (!API_KEY || !BASE_URL) {
      console.warn('LocationIQ API key or URL missing, using mock data');
      const mockLocations = [
        { place_id: '1', display_name: 'Lahore, Punjab, Pakistan', lat: 31.5204, lon: 74.3587 },
        { place_id: '2', display_name: 'Karachi, Sindh, Pakistan', lat: 24.8607, lon: 67.0011 },
        { place_id: '3', display_name: 'Islamabad, ICT, Pakistan', lat: 33.6844, lon: 73.0479 },
        { place_id: '4', display_name: 'Faisalabad, Punjab, Pakistan', lat: 31.4504, lon: 73.1350 },
        { place_id: '5', display_name: 'Rawalpindi, Punjab, Pakistan', lat: 33.5651, lon: 73.0169 },
        { place_id: '6', display_name: 'Multan, Punjab, Pakistan', lat: 30.1575, lon: 71.5249 },
        { place_id: '7', display_name: 'Peshawar, KPK, Pakistan', lat: 34.0151, lon: 71.5249 },
        { place_id: '8', display_name: 'Quetta, Balochistan, Pakistan', lat: 30.1798, lon: 66.9750 },
      ];
      return mockLocations.filter(loc => loc.display_name.toLowerCase().includes(query.toLowerCase()));
    }
    try {
      const response = await axios.get(`${BASE_URL}/autocomplete`, {
        params: {
          key: API_KEY,
          q: query,
          limit: 5,
          dedupe: 1
        }
      });
      return response.data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      return []; // Return empty instead of throwing to avoid breaking UI
    }
  },

  calculateDistance: async (origin: { lat: number; lon: number }, destination: { lat: number; lon: number }): Promise<number> => {
    if (!API_KEY || !BASE_URL) {
      // Simple Haversine approximation for offline/missing key support
      const R = 6371; // km
      const dLat = (destination.lat - origin.lat) * Math.PI / 180;
      const dLon = (destination.lon - origin.lon) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return Math.round(d * 100) / 100;
    }
    try {
      const response = await axios.get(`${BASE_URL}/directions/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`, {
        params: {
          key: API_KEY,
          geometries: 'geojson',
          overview: 'full'
        }
      });

      const distance = response.data.routes[0].distance / 1000; // Convert meters to kilometers
      return Math.round(distance * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Fallback to Haversine if API fails
      const R = 6371;
      const dLat = (destination.lat - origin.lat) * Math.PI / 180;
      const dLon = (destination.lon - origin.lon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 100) / 100;
    }
  }
};