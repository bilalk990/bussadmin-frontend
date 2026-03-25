import axios from 'axios';

// Use Nominatim (OpenStreetMap) as free alternative - no API key needed
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Add delay between requests to respect Nominatim usage policy
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const locationService = {
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    try {
      // Respect rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      }
      lastRequestTime = Date.now();

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
          'User-Agent': 'FastBuss-Admin/1.0 (contact@fastbuss.com)' // Required by Nominatim
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.data || response.data.length === 0) {
        console.log('No results from Nominatim for:', query);
        return [];
      }

      return response.data.map((item: any) => ({
        place_id: item.place_id.toString(),
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    } catch (error: any) {
      console.error('Error searching locations:', error.message || error);
      
      // Fallback to mock data if API fails
      const mockLocations = [
        { place_id: '1', display_name: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777 },
        { place_id: '2', display_name: 'Delhi, India', lat: 28.7041, lon: 77.1025 },
        { place_id: '3', display_name: 'Bangalore, Karnataka, India', lat: 12.9716, lon: 77.5946 },
        { place_id: '4', display_name: 'Hyderabad, Telangana, India', lat: 17.3850, lon: 78.4867 },
        { place_id: '5', display_name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707 },
        { place_id: '6', display_name: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639 },
        { place_id: '7', display_name: 'Pune, Maharashtra, India', lat: 18.5204, lon: 73.8567 },
        { place_id: '8', display_name: 'Ahmedabad, Gujarat, India', lat: 23.0225, lon: 72.5714 },
        { place_id: '9', display_name: 'Lahore, Punjab, Pakistan', lat: 31.5204, lon: 74.3587 },
        { place_id: '10', display_name: 'Karachi, Sindh, Pakistan', lat: 24.8607, lon: 67.0011 },
        { place_id: '11', display_name: 'Islamabad, ICT, Pakistan', lat: 33.6844, lon: 73.0479 },
        { place_id: '12', display_name: 'London, England, United Kingdom', lat: 51.5074, lon: -0.1278 },
        { place_id: '13', display_name: 'Paris, Île-de-France, France', lat: 48.8566, lon: 2.3522 },
        { place_id: '14', display_name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050 },
        { place_id: '15', display_name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
      ];
      
      const filtered = mockLocations.filter(loc => 
        loc.display_name.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log('Using fallback mock data, found:', filtered.length, 'results');
      return filtered;
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