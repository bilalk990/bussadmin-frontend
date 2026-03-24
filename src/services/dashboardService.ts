import { BASE_URL } from './config';
import { authService } from './authService';

export interface DashboardOverview {
  totalActiveBuses: number;
  totalActiveDrivers: number;
  totalActiveRoutes: number;
  totalScheduledTrips: number;
  totalCompletedTrips: number;
  revenueToday: number;
  revenueMonth: number;
}

export interface RecentActivity {
  recentTrips: Array<{
    route: string;
    bus: string;
    driver: string;
    departureTime: string;
    arrivalTime: string;
  }>;
  maintenanceAlerts: Array<{
    bus: string;
    status: string;
  }>;
  driverAssignments: Array<{
    route: string;
    bus: string;
    driver: string;
    departureTime: string;
  }>;
  routeChanges: Array<{
    route: string;
    status: string;
    updatedAt: string;
  }>;
  scheduleUpdates: Array<{
    route: string;
    departureTime: string;
    arrivalTime: string;
    updatedAt: string;
  }>;
}

export interface UpcomingSchedule {
  tripId: string;
  route: {
    from: string;
    to: string;
    distance: number;
  };
  bus: {
    plateNumber: string;
    name: string;
    capacity: number;
    type: string;
  };
  driver: {
    name: string;
    phone: string;
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
    status: string;
  };
}

export interface BusAnalytics {
  _id: string;
  busName: string;
  busNumber: string;
  busType: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  subCompanyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverAnalytics {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  assignedBusId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteAnalytics {
  _id: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  adultPrice: number;
  childPrice: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const dashboardService = {
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard overview');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  async getRecentActivities(): Promise<RecentActivity> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/recent-activities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  async getUpcomingSchedule(): Promise<UpcomingSchedule[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/dashboard/upcoming-schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming schedule');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching upcoming schedule:', error);
      throw error;
    }
  },

  async getBusAnalytics(): Promise<BusAnalytics[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/staff/buses`, {
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
  },

  async getDriverAnalytics(): Promise<DriverAnalytics[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/staff/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch driver analytics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching driver analytics:', error);
      throw error;
    }
  },

  async getRouteAnalytics(): Promise<RouteAnalytics[]> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/staff/all-routes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch route analytics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching route analytics:', error);
      throw error;
    }
  }
};