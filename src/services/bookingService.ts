import { BASE_URL } from './config';
import { authService } from './authService';

export interface Booking {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  tripId: number;
  busName: string;
  busPlate: string;
  routeName: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'resold';
  createdAt: string;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
}

export interface BookingsResponse {
  message: string;
  data: Booking[];
  stats: BookingStats;
}

export interface BusBookingSummary {
  busId: number;
  busName: string;
  busPlate: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  capacity: number;
}

export interface BusSummaryResponse {
  message: string;
  data: BusBookingSummary[];
}

const headers = () => ({
  'Authorization': `Bearer ${authService.getToken()}`,
  'Content-Type': 'application/json',
});

export const bookingService = {
  async getBookings(filters?: { status?: string; busId?: string; startDate?: string; endDate?: string }): Promise<BookingsResponse> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.busId && filters.busId !== 'all') params.append('busId', filters.busId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = `${BASE_URL}/sub-company/staff/bookings${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, { headers: headers() });

    if (authService.handleTokenExpiration(response)) throw new Error('Token expired');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
    return data;
  },

  async getBusSummary(): Promise<BusSummaryResponse> {
    const response = await fetch(`${BASE_URL}/sub-company/staff/bookings/bus-summary`, { headers: headers() });
    if (authService.handleTokenExpiration(response)) throw new Error('Token expired');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch bus summary');
    return data;
  },
};
