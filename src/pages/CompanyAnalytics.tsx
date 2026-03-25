import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, Bus, DollarSign, CheckCircle,
  XCircle, Loader2, ArrowLeft, RefreshCw,
} from 'lucide-react';
import {
  companyAnalyticsService,
  Company,
  CompanyDetailedAnalytics,
} from '../services/companyAnalyticsService';

const CompanyAnalytics: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [analytics, setAnalytics] = useState<CompanyDetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyAnalyticsService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async (company: Company) => {
    try {
      setDetailLoading(true);
      setSelectedCompany(company);
      setError(null);
      const data = await companyAnalyticsService.getCompanyDetails(company.id);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load company analytics');
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.agencyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = analytics
    ? [
        { label: 'Total Buses', value: analytics.overallStats.totalBuses, icon: <Bus size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Total Routes', value: analytics.overallStats.totalRoutes, icon: <BarChart2 size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Total Revenue', value: `$${analytics.overallStats.totalRevenue.toFixed(2)}`, icon: <DollarSign size={20} />, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Total Bookings', value: analytics.overallStats.totalBookings, icon: <CheckCircle size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Confirmed', value: analytics.overallStats.confirmedBookings, icon: <CheckCircle size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Cancelled', value: analytics.overallStats.cancelledBookings, icon: <XCircle size={20} />, color: 'text-red-400', bg: 'bg-red-500/10' },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={36} />
      </div>
    );
  }

  if (selectedCompany) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSelectedCompany(null); setAnalytics(null); }}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{selectedCompany.agencyName}</h1>
            <p className="text-sm text-gray-400">{selectedCompany.contactEmail}</p>
          </div>
          <button
            onClick={() => fetchCompanyDetails(selectedCompany)}
            className="ml-auto p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={detailLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        {detailLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-primary-500" size={32} />
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className={`rounded-xl p-4 ${card.bg} border border-gray-700/50`}>
                  <div className={`mb-2 ${card.color}`}>{card.icon}</div>
                  <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Buses */}
            <div className="bg-gray-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700/50">
                <h2 className="text-base font-semibold text-white">Buses</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700/50">
                      <th className="text-left px-5 py-3">Bus</th>
                      <th className="text-left px-5 py-3">Plate</th>
                      <th className="text-left px-5 py-3">Type</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Bookings</th>
                      <th className="text-right px-5 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.buses.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-gray-500 py-6">No buses found</td></tr>
                    ) : analytics.buses.map((bus) => (
                      <tr key={bus.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3 text-white font-medium">{bus.busName}</td>
                        <td className="px-5 py-3 text-gray-400">{bus.plateNumber}</td>
                        <td className="px-5 py-3 text-gray-400">{bus.busType}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bus.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {bus.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-300">{bus.totalBookings}</td>
                        <td className="px-5 py-3 text-right text-green-400">${bus.totalRevenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Routes */}
            <div className="bg-gray-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700/50">
                <h2 className="text-base font-semibold text-white">Routes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700/50">
                      <th className="text-left px-5 py-3">Route</th>
                      <th className="text-left px-5 py-3">From → To</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Bookings</th>
                      <th className="text-right px-5 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.routes.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-6">No routes found</td></tr>
                    ) : analytics.routes.map((route) => (
                      <tr key={route.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3 text-white font-medium">{route.routeName}</td>
                        <td className="px-5 py-3 text-gray-400">{route.origin} → {route.destination}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${route.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {route.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-300">{route.totalBookings}</td>
                        <td className="px-5 py-3 text-right text-green-400">${route.totalRevenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Drivers */}
            <div className="bg-gray-900 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700/50">
                <h2 className="text-base font-semibold text-white">Drivers</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700/50">
                      <th className="text-left px-5 py-3">Driver</th>
                      <th className="text-left px-5 py-3">Email</th>
                      <th className="text-left px-5 py-3">Assigned Bus</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Trips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.drivers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-6">No drivers found</td></tr>
                    ) : analytics.drivers.map((driver) => (
                      <tr key={driver.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3 text-white font-medium">{driver.driverName}</td>
                        <td className="px-5 py-3 text-gray-400">{driver.email}</td>
                        <td className="px-5 py-3 text-gray-400">{driver.busName ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${driver.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-300">{driver.totalTrips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Company Analytics</h1>
        <button
          onClick={fetchCompanies}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <input
        type="text"
        placeholder="Search companies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-72 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-10">No companies found.</p>
        ) : filteredCompanies.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-700/50 rounded-xl p-5 space-y-4 hover:border-primary-500/50 transition-colors cursor-pointer"
            onClick={() => fetchCompanyDetails(company)}
          >
            <div className="flex items-center gap-3">
              {company.logo ? (
                <img src={company.logo} alt={company.agencyName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-lg">
                  {company.agencyName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold">{company.agencyName}</h3>
                <p className="text-xs text-gray-400">{company.contactEmail}</p>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${company.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {company.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{company.stats?.buses ?? 0}</div>
                <div className="text-xs text-gray-400">Buses</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-400">{company.stats?.routes ?? 0}</div>
                <div className="text-xs text-gray-400">Routes</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">{company.stats?.totalBookings ?? 0}</div>
                <div className="text-xs text-gray-400">Bookings</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">${(company.stats?.totalRevenue ?? 0).toFixed(0)}</div>
                <div className="text-xs text-gray-400">Revenue</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-right">Click to view detailed analytics →</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CompanyAnalytics;
