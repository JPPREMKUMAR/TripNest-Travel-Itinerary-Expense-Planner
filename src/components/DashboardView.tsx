import React, { useMemo, useState } from 'react';
import { Trip, TripFilterTab } from '../types/trip';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  formatShortDate, 
  getTripTiming, 
  getTripDaysCount, 
  formatCalendarDate,
  parseCalendarDate
} from '../utils/dateUtils';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Search, 
  Archive, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Compass, 
  DollarSign, 
  CheckSquare, 
  Plane,
  AlertCircle,
  ArchiveRestore
} from 'lucide-react';

interface DashboardViewProps {
  trips: Trip[];
  recentlyViewedIds: string[];
  onSelectTrip: (tripId: string) => void;
  onNewTrip: () => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onToggleArchive: (tripId: string) => void;
  onResetDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trips,
  recentlyViewedIds,
  onSelectTrip,
  onNewTrip,
  onEditTrip,
  onDeleteTrip,
  onToggleArchive,
  onResetDemo,
}) => {
  const [filterTab, setFilterTab] = useState<TripFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find next upcoming trip for countdown hero
  const nextTrip = useMemo(() => {
    const activeTrips = trips.filter(t => !t.isArchived);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Prefer trips that are upcoming or ongoing
    const candidateTrips = activeTrips
      .filter(t => t.endDate >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    return candidateTrips.length > 0 ? candidateTrips[0] : null;
  }, [trips]);

  // Overall financial and travel statistics across all active trips
  const stats = useMemo(() => {
    const activeTrips = trips.filter(t => !t.isArchived);
    let totalEst = 0;
    let totalAct = 0;
    let totalActivities = 0;
    let completedActivities = 0;

    activeTrips.forEach(trip => {
      trip.expenses.forEach(exp => {
        totalEst += exp.estimatedCost || 0;
        totalAct += exp.actualCost || 0;
      });
      trip.activities.forEach(act => {
        totalActivities++;
        if (act.isCompleted) completedActivities++;
      });
    });

    const variance = totalAct - totalEst;

    return {
      activeCount: activeTrips.length,
      totalEst,
      totalAct,
      variance,
      totalActivities,
      completedActivities,
    };
  }, [trips]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const timing = getTripTiming(trip.startDate, trip.endDate);

      // Status filter
      if (filterTab === 'archived') {
        if (!trip.isArchived) return false;
      } else {
        if (trip.isArchived) return false;
        if (filterTab === 'upcoming' && timing.status !== 'upcoming') return false;
        if (filterTab === 'ongoing' && timing.status !== 'ongoing') return false;
        if (filterTab === 'past' && timing.status !== 'past') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDest = trip.destination.toLowerCase().includes(query);
        const matchNotes = (trip.notes || '').toLowerCase().includes(query);
        return matchDest || matchNotes;
      }

      return true;
    }).sort((a, b) => {
      // Sort upcoming and ongoing first
      return a.startDate.localeCompare(b.startDate);
    });
  }, [trips, filterTab, searchQuery]);

  // Recently viewed trip objects
  const recentlyViewedTrips = useMemo(() => {
    return recentlyViewedIds
      .map(id => trips.find(t => t.id === id))
      .filter((t): t is Trip => Boolean(t))
      .slice(0, 4);
  }, [recentlyViewedIds, trips]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Hero / Next Trip Countdown Spotlight */}
      {nextTrip ? (
        (() => {
          const timing = getTripTiming(nextTrip.startDate, nextTrip.endDate);
          const daysCount = getTripDaysCount(nextTrip.startDate, nextTrip.endDate);
          const tripTotalEst = nextTrip.expenses.reduce((sum, e) => sum + (e.estimatedCost || 0), 0);
          const tripTotalAct = nextTrip.expenses.reduce((sum, e) => sum + (e.actualCost || 0), 0);

          return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white shadow-xl border border-stone-800">
              {/* Background cover image with measured gradient scrim */}
              {nextTrip.coverImageUrl && (
                <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
                  <ImageWithFallback
                    src={nextTrip.coverImageUrl}
                    fallbackTitle={nextTrip.destination}
                    fallbackSubtitle="Cover"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/60 to-transparent z-0" />

              <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  {/* Quiet Editorial Kicker (NO PILL) */}
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                    <Compass className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>NEXT ADVENTURE SPOTLIGHT</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold">{timing.label}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {nextTrip.destination}
                  </h1>

                  <p className="text-sm text-stone-300 line-clamp-2 leading-relaxed">
                    {nextTrip.notes || 'Full day-by-day travel itinerary with estimated expenses and packing checklist.'}
                  </p>

                  {/* Trip details metadata (Zero-pill discipline) */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      <span>{formatCalendarDate(nextTrip.startDate)} – {formatCalendarDate(nextTrip.endDate)}</span>
                    </div>
                    <span className="text-stone-500">·</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      <span>{daysCount} Days</span>
                    </div>
                    <span className="text-stone-500">·</span>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-mono tabular-nums">${tripTotalAct.toLocaleString()} spent of ${tripTotalEst.toLocaleString()} est.</span>
                    </div>
                  </div>
                </div>

                {/* Right Action & Countdown Badge */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto shrink-0">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center sm:text-right lg:min-w-[180px]">
                    <span className="text-[11px] uppercase tracking-wider text-amber-200/90 font-semibold block">
                      Departure Timing
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums block mt-0.5">
                      {timing.daysRemaining > 0 ? `${timing.daysRemaining} Days` : timing.status === 'ongoing' ? 'Now Active' : 'Ready'}
                    </span>
                    <span className="text-xs text-stone-300 block mt-0.5">
                      {timing.status === 'ongoing' ? 'Trip in progress' : 'Until departure'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectTrip(nextTrip.id)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-md transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <span>Open Planner</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : null}

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trips */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>ACTIVE TRIPS</span>
            <Compass className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
              {stats.activeCount}
            </span>
            <p className="text-xs text-stone-500 mt-1">Across all destinations</p>
          </div>
        </div>

        {/* Planned Budget */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>TOTAL ESTIMATED</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
              ${stats.totalEst.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <p className="text-xs text-stone-500 mt-1">Planned trip budgets</p>
          </div>
        </div>

        {/* Total Actual Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>TOTAL ACTUAL SPENT</span>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-orange-600 font-mono tabular-nums">
              ${stats.totalAct.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <p className="text-xs text-stone-500 mt-1">Booked flights & stays</p>
          </div>
        </div>

        {/* Budget Variance */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>BUDGET VARIANCE</span>
            <span className={`text-xs font-bold font-mono tabular-nums ${stats.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {stats.variance > 0 ? 'Over' : 'Under'}
            </span>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${stats.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {stats.variance >= 0 ? `+$${stats.variance.toLocaleString()}` : `-$${Math.abs(stats.variance).toLocaleString()}`}
            </span>
            <p className="text-xs text-stone-500 mt-1">
              {stats.variance <= 0 ? 'Under planned budget' : 'Exceeding budget'}
            </p>
          </div>
        </div>
      </div>

      {/* Recently Viewed Carousel / Quick Access */}
      {recentlyViewedTrips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>Recently Viewed</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentlyViewedTrips.map(rTrip => (
              <button
                key={rTrip.id}
                onClick={() => onSelectTrip(rTrip.id)}
                className="group p-3 bg-white hover:bg-orange-50/50 rounded-xl border border-stone-200 hover:border-orange-200 text-left transition-all flex items-center gap-3 shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                  <ImageWithFallback
                    src={rTrip.coverImageUrl}
                    fallbackTitle={rTrip.destination}
                    fallbackSubtitle=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    containerClassName="w-full h-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-800 truncate group-hover:text-orange-600 transition-colors">
                    {rTrip.destination}
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono tabular-nums truncate">
                    {formatShortDate(rTrip.startDate)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Header: Search & Interactive Filter Tabs */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              All Planned Trips
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Organize day itineraries, check estimated vs actual costs, and view packing lists
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination or note..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Segmented Bar (Interactive tabs) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Trips' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'ongoing', label: 'Ongoing Now' },
              { id: 'past', label: 'Past Trips' },
              { id: 'archived', label: 'Archived' },
            ] as const
          ).map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trips Grid or Empty State */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto text-orange-600 shadow-inner">
            <Compass className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              No trips found
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No trips matching "${searchQuery}". Try a different keyword.`
                : filterTab !== 'all'
                ? `No ${filterTab} trips at the moment. Plan a new escape or reset demo trips!`
                : 'No trips planned yet, time to explore! Create your first travel itinerary below.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onNewTrip}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all"
            >
              Plan a New Trip
            </button>
            <button
              onClick={onResetDemo}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
            >
              Load Demo Trips
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const timing = getTripTiming(trip.startDate, trip.endDate);
            const daysCount = getTripDaysCount(trip.startDate, trip.endDate);
            const totalEst = trip.expenses.reduce((acc, e) => acc + (e.estimatedCost || 0), 0);
            const totalAct = trip.expenses.reduce((acc, e) => acc + (e.actualCost || 0), 0);
            const packedCount = trip.checklist.filter(c => c.isPacked).length;
            const totalPack = trip.checklist.length;
            const completedActivities = trip.activities.filter(a => a.isCompleted).length;

            return (
              <div
                key={trip.id}
                className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Cover Image Header */}
                <div 
                  onClick={() => onSelectTrip(trip.id)}
                  className="relative h-48 cursor-pointer overflow-hidden bg-stone-100"
                >
                  <ImageWithFallback
                    src={trip.coverImageUrl}
                    fallbackTitle={trip.destination}
                    fallbackSubtitle={`${daysCount} Days`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                  />

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />

                  {/* Top Status & Timing Info */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-900/70 backdrop-blur-md text-white border border-white/10">
                      {timing.label}
                    </span>

                    {trip.isArchived && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold drop-shadow-sm truncate">
                      {trip.destination}
                    </h3>
                    <p className="text-xs text-stone-200 drop-shadow-xs font-mono tabular-nums">
                      {formatShortDate(trip.startDate)} – {formatShortDate(trip.endDate)} · {daysCount} Days
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Notes / Description */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {trip.notes || 'No description provided. Click to add itinerary activities and packing items.'}
                  </p>

                  {/* Metrics preview (Zero-pill discipline) */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    {/* Budget row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Expenses:</span>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 font-mono tabular-nums">
                          ${totalAct.toLocaleString()}
                        </span>
                        <span className="text-stone-400 font-mono tabular-nums"> / ${totalEst.toLocaleString()} est</span>
                      </div>
                    </div>

                    {/* Progress indicators: Activities & Checklist */}
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-orange-600" />
                        <span className="font-mono tabular-nums">{completedActivities}/{trip.activities.length}</span> activities
                      </span>
                      <span className="flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono tabular-nums">{packedCount}/{totalPack}</span> packed
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    {/* Secondary Actions (Edit, Archive, Delete) */}
                    <div className="flex items-center gap-1 text-stone-400">
                      <button
                        onClick={() => onEditTrip(trip)}
                        title="Edit Trip Details"
                        className="p-1.5 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onToggleArchive(trip.id)}
                        title={trip.isArchived ? 'Unarchive Trip' : 'Archive Trip'}
                        className="p-1.5 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        {trip.isArchived ? (
                          <ArchiveRestore className="w-4 h-4" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        title="Delete Trip"
                        className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Primary Button */}
                    <button
                      onClick={() => onSelectTrip(trip.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <span>View Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
