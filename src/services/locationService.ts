import axios from 'axios';

// Use Nominatim (OpenStreetMap) as free alternative - no API key needed
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

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
    try {
      // Use Nominatim for worldwide location search (free, no API key needed)
      const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 10,
          addressdetails: 1,
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'FastBuss-Admin/1.0' // Required by Nominatim
        }
      });
      
      return response.data.map((item: any) => ({
        place_id: item.place_id.toString(),
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      // Fallback to mock data if API fails
      const mockLocations = [
        { place_id: '1', display_name: 'Lahore, Punjab, Pakistan', lat: 31.5204, lon: 74.3587 },
        { place_id: '2', display_name: 'Karachi, Sindh, Pakistan', lat: 24.8607, lon: 67.0011 },
        { place_id: '3', display_name: 'Islamabad, ICT, Pakistan', lat: 33.6844, lon: 73.0479 },
        { place_id: '4', display_name: 'London, England, United Kingdom', lat: 51.5074, lon: -0.1278 },
        { place_id: '5', display_name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
        { place_id: '6', display_name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050 },
        { place_id: '7', display_name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
        { place_id: '8', display_name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
      ];
      return mockLocations.filter(loc => loc.display_name.toLowerCase().includes(query.toLowerCase()));
    }
  },

  calculateDistance: async (origin: { lat: number; lon: number }, destination: { lat: number; lon: number }): Promise<number> => {
    // Use Haversine formula for distance calculation (accurate enough for most cases)
    const R = 6371; // Earth's radius in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lon - origin.lon) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 100) / 100; // Round to 2 decimal places
  }
};