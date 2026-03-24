import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket, Search, RefreshCw, TrendingUp,
  CheckCircle, Clock, XCircle, Bus, ChevronDown, ChevronUp
} from 'lucide-react';
import { bookingService, Booking, BusBookingSummary } from '../services/bookingService';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-900/40 text-green-400 border border-green-700/40',
  pending:   'bg-yellow-900/40 text-yellow-400 border border-yellow-700/40',
  cancelled: 'bg-red-900/40 text-red-400 border border-red-700/40',
  resold:    'bg-blue-900/40 text-blue-400 border border-blue-700/40',
};

const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busSummary, setBusSummary] = useState<BusBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'buses'>('bookings');
  const [expandedBus, setExpandedBus] = useState<number | null>(null);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsRes, summaryRes] = await Promise.allSettled([
        bookingService.getBookings({ status: statusFilter, busId: busFilter }),
        bookingService.getBusSummary(),
      ]);

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.data || []);
        setStats(bookingsRes.value.stats);
      } else {
        setBookings([]);
      }
      if (summaryRes.status === 'fulfilled') {
        setBusSummary(summaryRes.value.data || []);
      }
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter, busFilter]);

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.userName.toLowerCase().includes(q) ||
      b.userEmail.toLowerCase().includes(q) ||
      b.busName.toLowerCase().includes(q) ||
      b.routeName.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q);
  });

  // Unique buses for filter dropdown
  const uniqueBuses = Array.from(new Map(busSummary.map(b => [b.busId, b])).values());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track all passenger bookings across your fleet</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: <Ticket size={16} />, color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { label: 'Confirmed', value: stats.confirmed, icon: <CheckCircle size={16} />, color: 'text-green-400', bg: 'bg-green-900/20' },
          { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
          { label: 'Cancelled', value: stats.cancelled, icon: <XCircle size={16} />, color: 'text-red-400', bg: 'bg-red-900/20' },
          { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: <TrendingUp size={16} />, color: 'text-purple-400', bg: 'bg-purple-900/20' },
        ].map((s, i) => (
          <motion.div key={s.label} className="glass-card p-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${s.bg} ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {(['bookings', 'buses'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}>
            {tab === 'bookings' ? 'All Bookings' : 'Per Bus Summary'}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <>
          {/* Filters */}
          <div className="glass-card p-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by passenger, bus, route..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="resold">Resold</option>
              </select>
              <select value={busFilter} onChange={e => setBusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Buses</option>
                {uniqueBuses.map(b => (
                  <option key={b.busId} value={b.busId}>{b.busName} [{b.busPlate}]</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <RefreshCw size={20} className="animate-spin text-blue-400" />
                <span className="text-gray-400">Loading bookings...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-400">{error}</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <Ticket size={40} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No bookings found</p>
                <p className="text-gray-500 text-sm mt-1">Bookings will appear here once passengers book trips</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                      <th className="text-left px-4 py-3">Booking ID</th>
                      <th className="text-left px-4 py-3">Passenger</th>
                      <th className="text-left px-4 py-3">Bus / Route</th>
                      <th className="text-left px-4 py-3">Departure</th>
                      <th className="text-right px-4 py-3">Amount</th>
                      <th className="text-center px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, i) => (
                      <motion.tr key={b.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{b.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{b.userEmail !== 'N/A' ? b.userEmail : 'Passenger'}</p>
                          <p className="text-gray-500 text-xs">{b.userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white">{b.busName} <span className="text-gray-500 text-xs">[{b.busPlate}]</span></p>
                          <p className="text-gray-400 text-xs">{b.origin} → {b.destination}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white">{b.departureDate}</p>
                          <p className="text-gray-400 text-xs">{b.departureTime}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium">${Number(b.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                            {b.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'buses' && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw size={20} className="animate-spin text-blue-400" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : busSummary.length === 0 ? (
            <div className="glass-card text-center py-16">
              <Bus size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No buses found</p>
            </div>
          ) : busSummary.map((bus, i) => (
            <motion.div key={bus.busId} className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors"
                onClick={() => setExpandedBus(expandedBus === bus.busId ? null : bus.busId)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <Bus size={18} className="text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{bus.busName}</p>
                    <p className="text-gray-400 text-xs">{bus.busPlate} · Capacity: {bus.capacity} seats</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-semibold">{bus.totalBookings} bookings</p>
                    <p className="text-green-400 text-xs">${bus.totalRevenue.toFixed(2)} revenue</p>
                  </div>
                  {/* Occupancy bar */}
                  <div className="hidden md:flex flex-col items-end gap-1 w-24">
                    <span className="text-xs text-gray-400">{bus.occupancyRate}% occupancy</span>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(bus.occupancyRate, 100)}%` }} />
                    </div>
                  </div>
                  {expandedBus === bus.busId ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {expandedBus === bus.busId && (
                <div className="border-t border-gray-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Bookings', value: bus.totalBookings, color: 'text-blue-400' },
                    { label: 'Confirmed', value: bus.confirmedBookings, color: 'text-green-400' },
                    { label: 'Pending', value: bus.pendingBookings, color: 'text-yellow-400' },
                    { label: 'Cancelled', value: bus.cancelledBookings, color: 'text-red-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-800/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 sm:col-span-4 bg-gray-800/40 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Total Revenue (confirmed)</span>
                    <span className="text-green-400 font-bold text-lg">${bus.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BookingsManagement;
