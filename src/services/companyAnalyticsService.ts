import { authService } from './authService';
import { BASE_URL } from './config';

export interface CompanyStats {
  buses: number;
  routes: number;
  drivers: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export interface Company {
  id: number;
  agencyName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  stats: CompanyStats;
}

export interface BusAnalytics {
  id: number;
  busName: string;
  plateNumber: string;
  busType: string;
  capacity: number;
  status: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalTrips: number;
  completedTrips: number;
  scheduledTrips: number;
}

export interface RouteAnalytics {
  id: number;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  adultPrice: number;
  status: string;
  totalBookings: number;
  totalRevenue: number;
  totalTrips: number;
}

export interface DriverAnalytics {
  id: number;
  driverName: string;
  email: string;
  phone: string;
  status: string;
  busId: number | null;
  busName: string | null;
  busPlate: string | null;
  totalTrips: number;
  completedTrips: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
}

export interface CompanyDetailedAnalytics {
  company: {
    id: number;
    agencyName: string;
    logo: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
    isActive: boolean;
    createdAt: string;
  };
  overallStats: {
    totalBuses: number;
    activeBuses: number;
    totalRoutes: number;
    activeRoutes: number;
    totalDrivers: number;
    activeDrivers: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    totalTrips: number;
    completedTrips: number;
    scheduledTrips: number;
  };
  buses: BusAnalytics[];
  routes: RouteAnalytics[];
  drivers: DriverAnalytics[];
  bookingTrends: BookingTrend[];
}

export const companyAnalyticsService = {
  async getAllCompanies(): Promise<Company[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/analytics/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async getCompanyDetails(companyId: number): Promise<CompanyDetailedAnalytics> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/analytics/company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  async getBusAnalytics(busId: number, startDate?: string, endDate?: string) {
    try {
      const token = authService.getToken();
      let url = `${BASE_URL}/analytics/bus/${busId}`;
      
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch bus analytics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching bus analytics:', error);
      throw error;
    }
  }
};
