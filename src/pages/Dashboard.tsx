import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, Route as RouteIcon, Building2, Loader2, RefreshCw } from 'lucide-react';
import { BASE_URL } from '../services/config';
import { authService } from '../services/authService';
import StatCard from '../components/dashboard/StatCard';
import ActiveBusMap from '../components/dashboard/ActiveBusMap';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';

interface BusData {
  _id: string;
  busName?: string;
  name?: string;
  busNumber?: string;
  plateNumber?: string;
  capacity: number;
  status: string;
  type?: string;
}

interface DriverData { _id: string; name: string; status: string; }
interface RouteData  { _id: string; routeName: string; origin: string; destination: string; status: string; }
interface CompanyData { id: string; agencyName: string; isActive: boolean; }

const fetchWithAuth = async (url: string) => {
  const token = authService.getToken();
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

// ── Super Admin Dashboard ────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${BASE_URL}/super-admin/list-sub-companies`).catch(() => ({ data: [] }));
      setCompanies(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const active   = companies.filter(c => c.isActive).length;
  const inactive = companies.filter(c => !c.isActive).length;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Companies"  value={companies.length} icon={Building2} iconColor="text-blue-400"   iconBgColor="bg-blue-900/40"   change={{ value: companies.length, isPositive: true }} metric="registered" />
        <StatCard title="Active Companies" value={active}           icon={Building2} iconColor="text-green-400"  iconBgColor="bg-green-900/40"  change={{ value: active, isPositive: true }}           metric="active" />
        <StatCard title="Suspended"        value={inactive}         icon={Building2} iconColor="text-red-400"    iconBgColor="bg-red-900/40"    change={{ value: inactive, isPositive: false }}        metric="suspended" />
      </div>

      {/* Companies list */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-white font-semibold">Registered Companies</h2>
        </div>
        {companies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 text-gray-600" />
            <p>No companies yet. Add one from the Companies page.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {companies.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center">
                    <Building2 size={14} className="text-blue-400" />
                  </div>
                  <span className="text-white text-sm font-medium">{c.agencyName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                  {c.isActive ? 'Active' : 'Suspended'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Company Dashboard ────────────────────────────────────────────────────────
const CompanyDashboard = () => {
  const [loading, setLoading]   = useState(true);
  const [buses, setBuses]       = useState<BusData[]>([]);
  const [drivers, setDrivers]   = useState<DriverData[]>([]);
  const [routes, setRoutes]     = useState<RouteData[]>([]);

  const load = async () => {
    setLoading(true);
    const [busRes, driverRes, routeRes] = await Promise.all([
      fetchWithAuth(`${BASE_URL}/sub-company/staff/buses`).catch(() => ({ data: [] })),
      fetchWithAuth(`${BASE_URL}/sub-company/staff/drivers`).catch(() => ({ data: [] })),
      fetchWithAuth(`${BASE_URL}/sub-company/staff/all-routes`).catch(() => ({ data: [] })),
    ]);
    setBuses(busRes.data || []);
    setDrivers(driverRes.data || []);
    setRoutes(routeRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const activeBuses   = buses.filter(b => b.status === 'active').length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const activeRoutes  = routes.filter(r => r.status === 'active').length;
  const totalCapacity = buses.filter(b => b.status === 'active').reduce((s, b) => s + (b.capacity || 0), 0);

  const mockAnalytics = {
    passengersByDay: [
      { day: 'Mon', count: 2840 }, { day: 'Tue', count: 2650 }, { day: 'Wed', count: 2790 },
      { day: 'Thu', count: 3050 }, { day: 'Fri', count: 3450 }, { day: 'Sat', count: 2100 }, { day: 'Sun', count: 1750 },
    ]
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4 sm:gap-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white">
            <RefreshCw size={14} /> Refresh
          </button>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Active Buses"    value={activeBuses}   icon={Bus}       iconColor="text-primary-400"  iconBgColor="bg-primary-900/60"   change={{ value: buses.length,   isPositive: true }} metric={`of ${buses.length}`} />
        <StatCard title="Active Drivers"  value={activeDrivers} icon={Users}     iconColor="text-secondary-400" iconBgColor="bg-secondary-900/60" change={{ value: drivers.length, isPositive: true }} metric={`of ${drivers.length}`} />
        <StatCard title="Active Routes"   value={activeRoutes}  icon={RouteIcon} iconColor="text-accent-400"   iconBgColor="bg-accent-900/60"    change={{ value: routes.length,  isPositive: true }} metric={`of ${routes.length}`} />
        <StatCard title="Total Capacity"  value={totalCapacity} icon={Users}     iconColor="text-success-400"  iconBgColor="bg-success-900/60"   change={{ value: buses.length,   isPositive: true }} metric="seats" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ActiveBusMap buses={buses.map(bus => ({
            id: String(bus._id),
            _id: String(bus._id),
            busName: bus.busName || bus.name || 'N/A',
            busNumber: bus.busNumber || (bus as any).plateNumber || 'N/A',
            busType: (bus as any).type || 'standard',
            capacity: bus.capacity || 0,
            status: (['active','inactive','maintenance','blocked'].includes(bus.status) ? bus.status : 'inactive') as any,
            agencyId: '',
            subCompanyId: '', createdAt: '', updatedAt: '',
          }))} />
        </div>
        <div className="mb-8 sm:mb-12">
          <AnalyticsChart data={{
            passengersByDay: mockAnalytics.passengersByDay,
            busUtilization: [], routePerformance: [], fuelConsumption: [],
          }} />
        </div>
      </div>
    </motion.div>
  );
};

// ── Root ─────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const role = authService.getTokenPayload()?.role;
  return role === 'super_admin' ? <SuperAdminDashboard /> : <CompanyDashboard />;
};

export default Dashboard;
