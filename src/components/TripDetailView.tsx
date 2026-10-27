import React, { useState, useMemo } from 'react';
import { 
  Trip, 
  TripDetailTab, 
  Activity, 
  Expense, 
  ChecklistItem, 
  TravelLink, 
  TravelNote, 
  PhotoItem, 
  ExpenseCategory, 
  ChecklistCategory 
} from '../types/trip';
import { ImageWithFallback } from './ImageWithFallback';
import { ActivityModal } from './ActivityModal';
import { ExpenseModal } from './ExpenseModal';
import { LinkModal } from './LinkModal';
import { PhotoModal } from './PhotoModal';
import { 
  formatCalendarDate, 
  formatShortDate, 
  formatDayOfWeek,
  getTripDaysCount, 
  getTripTiming, 
  getDatesBetween, 
  isDateWithinRange 
} from '../utils/dateUtils';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  DollarSign, 
  CheckSquare, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Check, 
  Copy, 
  Compass, 
  Sparkles, 
  Pin, 
  Maximize2, 
  X, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Archive,
  ArchiveRestore
} from 'lucide-react';

interface TripDetailViewProps {
  trip: Trip;
  onBack: () => void;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onEditTripDetails: () => void;
  onDeleteTrip: () => void;
  onToggleArchive: () => void;
}

const DEFAULT_PACKING_ITEMS: Array<{ text: string; category: ChecklistCategory }> = [
  { text: 'Passport & Photocopy of ID', category: 'Documents' },
  { text: 'Travel Insurance Details & Boarding Passes', category: 'Documents' },
  { text: 'Universal Power Adapter & Cable Organizers', category: 'Electronics' },
  { text: 'Portable Power Bank (10,000mAh)', category: 'Electronics' },
  { text: 'Noise-Cancelling Headphones', category: 'Electronics' },
  { text: 'Comfortable Walking Shoes', category: 'Clothing' },
  { text: 'Breathable Weather-Appropriate Layers', category: 'Clothing' },
  { text: 'Lightweight Rain Jacket / Windbreaker', category: 'Clothing' },
  { text: 'Toothbrush, Paste & Floss', category: 'Toiletries' },
  { text: 'Travel Size Sunscreen & Lip Balm', category: 'Toiletries' },
  { text: 'Personal Medications & Mini First Aid Kit', category: 'Toiletries' },
  { text: 'Reusable Water Bottle', category: 'Gear' },
  { text: 'Compact Umbrella / Daypack', category: 'Gear' },
  { text: 'Emergency Cash in Local Currency', category: 'General' },
];

export const TripDetailView: React.FC<TripDetailViewProps> = ({
  trip,
  onBack,
  onUpdateTrip,
  onEditTripDetails,
  onDeleteTrip,
  onToggleArchive,
}) => {
  const [activeTab, setActiveTab] = useState<TripDetailTab>('itinerary');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all'); // 'all' or specific 'YYYY-MM-DD'
  
  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<TravelLink | null>(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);

  // New Note state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // New Checklist quick item state
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<ChecklistCategory>('General');
  const [checklistFilter, setChecklistFilter] = useState<string>('all');

  // Days list
  const tripDays = useMemo(() => {
    return getDatesBetween(trip.startDate, trip.endDate);
  }, [trip.startDate, trip.endDate]);

  const timing = getTripTiming(trip.startDate, trip.endDate);
  const daysCount = getTripDaysCount(trip.startDate, trip.endDate);

  // Financial calculations
  const totalEstimatedCost = useMemo(() => {
    return trip.expenses.reduce((sum, exp) => sum + (exp.estimatedCost || 0), 0);
  }, [trip.expenses]);

  const totalActualCost = useMemo(() => {
    return trip.expenses.reduce((sum, exp) => sum + (exp.actualCost || 0), 0);
  }, [trip.expenses]);

  const budgetVariance = totalActualCost - totalEstimatedCost;
  const budgetUtilization = totalEstimatedCost > 0 ? (totalActualCost / totalEstimatedCost) * 100 : 0;

  // Expenses grouped by category
  const expensesByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, { estimated: number; actual: number; count: number }>();
    trip.expenses.forEach(exp => {
      const current = map.get(exp.category) || { estimated: 0, actual: 0, count: 0 };
      map.set(exp.category, {
        estimated: current.estimated + (exp.estimatedCost || 0),
        actual: current.actual + (exp.actualCost || 0),
        count: current.count + 1,
      });
    });
    return map;
  }, [trip.expenses]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    let list = trip.activities;
    if (selectedDayFilter !== 'all') {
      list = list.filter(act => act.date === selectedDayFilter);
    }
    return [...list].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [trip.activities, selectedDayFilter]);

  // Activity Handlers
  const handleSaveActivity = (activityData: Omit<Activity, 'id'>) => {
    if (activityToEdit) {
      const updated = trip.activities.map(a => a.id === activityToEdit.id ? { ...activityData, id: a.id } : a);
      onUpdateTrip({ ...trip, activities: updated });
    } else {
      const newActivity: Activity = {
        ...activityData,
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      onUpdateTrip({ ...trip, activities: [...trip.activities, newActivity] });
    }
    setIsActivityModalOpen(false);
    setActivityToEdit(null);
  };

  const handleDeleteActivity = (id: string) => {
    onUpdateTrip({ ...trip, activities: trip.activities.filter(a => a.id !== id) });
  };

  const handleToggleActivity = (id: string) => {
    const updated = trip.activities.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a);
    onUpdateTrip({ ...trip, activities: updated });
  };

  // Expense Handlers
  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (expenseToEdit) {
      const updated = trip.expenses.map(e => e.id === expenseToEdit.id ? { ...expenseData, id: e.id } : e);
      onUpdateTrip({ ...trip, expenses: updated });
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      onUpdateTrip({ ...trip, expenses: [...trip.expenses, newExpense] });
    }
    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateTrip({ ...trip, expenses: trip.expenses.filter(e => e.id !== id) });
  };

  // Checklist Handlers
  const handleToggleChecklist = (id: string) => {
    const updated = trip.checklist.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item);
    onUpdateTrip({ ...trip, checklist: updated });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newChecklistText.trim(),
      category: newChecklistCategory,
      isPacked: false,
    };

    onUpdateTrip({ ...trip, checklist: [...trip.checklist, newItem] });
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id: string) => {
    onUpdateTrip({ ...trip, checklist: trip.checklist.filter(item => item.id !== id) });
  };

  const handlePackAll = (packState: boolean) => {
    const updated = trip.checklist.map(item => ({ ...item, isPacked: packState }));
    onUpdateTrip({ ...trip, checklist: updated });
  };

  const handleLoadVacationChecklistTemplate = () => {
    const existingTexts = new Set(trip.checklist.map(i => i.text.toLowerCase()));
    const newItems: ChecklistItem[] = DEFAULT_PACKING_ITEMS
      .filter(item => !existingTexts.has(item.text.toLowerCase()))
      .map(item => ({
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: item.text,
        category: item.category,
        isPacked: false,
      }));

    if (newItems.length > 0) {
      onUpdateTrip({ ...trip, checklist: [...trip.checklist, ...newItems] });
    }
  };

  // Travel Links Handlers
  const handleSaveLink = (linkData: Omit<TravelLink, 'id'>) => {
    if (linkToEdit) {
      const updated = trip.links.map(l => l.id === linkToEdit.id ? { ...linkData, id: l.id } : l);
      onUpdateTrip({ ...trip, links: updated });
    } else {
      const newLink: TravelLink = {
        ...linkData,
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      onUpdateTrip({ ...trip, links: [...trip.links, newLink] });
    }
    setIsLinkModalOpen(false);
    setLinkToEdit(null);
  };

  const handleDeleteLink = (id: string) => {
    onUpdateTrip({ ...trip, links: trip.links.filter(l => l.id !== id) });
  };

  // Notes Handlers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    const newNote: TravelNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newNoteTitle.trim() || 'Untitled Note',
      content: newNoteContent.trim(),
      isPinned: false,
      updatedAt: new Date().toISOString(),
    };

    onUpdateTrip({ ...trip, notesList: [newNote, ...trip.notesList] });
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    onUpdateTrip({ ...trip, notesList: trip.notesList.filter(n => n.id !== id) });
  };

  const handleTogglePinNote = (id: string) => {
    const updated = trip.notesList.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    onUpdateTrip({ ...trip, notesList: updated });
  };

  // Photos Handlers
  const handleSavePhoto = (photoData: Omit<PhotoItem, 'id'>) => {
    const newPhoto: PhotoItem = {
      ...photoData,
      id: `ph-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    onUpdateTrip({ ...trip, photos: [newPhoto, ...trip.photos] });
    setIsPhotoModalOpen(false);
  };

  const handleDeletePhoto = (id: string) => {
    onUpdateTrip({ ...trip, photos: trip.photos.filter(p => p.id !== id) });
  };

  // Packing statistics
  const packedCount = trip.checklist.filter(c => c.isPacked).length;
  const totalPackItems = trip.checklist.length;
  const packPercent = totalPackItems > 0 ? Math.round((packedCount / totalPackItems) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner & Destination Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white shadow-xl border border-stone-800">
        {/* Cover Photo */}
        <div className="h-56 sm:h-72 w-full relative">
          <ImageWithFallback
            src={trip.coverImageUrl}
            fallbackTitle={trip.destination}
            fallbackSubtitle={`${daysCount} Days Travel Planner`}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-stone-950/20" />
        </div>

        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900/80 hover:bg-stone-900 rounded-xl backdrop-blur-md border border-white/10 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Trips</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onEditTripDetails}
              title="Edit Trip Settings"
              className="p-2 text-white bg-stone-900/80 hover:bg-stone-900 rounded-xl backdrop-blur-md border border-white/10 transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleArchive}
              title={trip.isArchived ? 'Unarchive' : 'Archive'}
              className="p-2 text-white bg-stone-900/80 hover:bg-stone-900 rounded-xl backdrop-blur-md border border-white/10 transition-colors shadow-sm"
            >
              {trip.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
            <button
              onClick={onDeleteTrip}
              title="Delete Trip"
              className="p-2 text-red-300 hover:text-red-100 bg-red-950/80 hover:bg-red-900 rounded-xl backdrop-blur-md border border-red-500/20 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Title & Details */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              {/* Quiet unboxed metadata */}
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Compass className="w-4 h-4 text-orange-400" />
                <span>{timing.label}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{daysCount} Days ({tripDays.length} Itinerary Days)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {trip.destination}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-mono tabular-nums">{formatCalendarDate(trip.startDate)} – {formatCalendarDate(trip.endDate)}</span>
                </div>
                <span className="text-stone-500">·</span>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-mono tabular-nums">${totalActualCost.toLocaleString()} spent of ${totalEstimatedCost.toLocaleString()} est</span>
                </div>
                <span className="text-stone-500">·</span>
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-mono tabular-nums">{packedCount}/{totalPackItems} packed ({packPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Quick Trip Notes Callout */}
            {trip.notes && (
              <div className="max-w-md bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 text-xs text-stone-300">
                <p className="line-clamp-3 leading-relaxed">{trip.notes}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-2xl overflow-x-auto shadow-inner">
        {[
          { id: 'itinerary', label: 'Day-by-Day Itinerary', count: trip.activities.length, icon: Calendar },
          { id: 'expenses', label: 'Expenses & Budget', count: `$${totalActualCost.toLocaleString()}`, icon: DollarSign },
          { id: 'checklist', label: 'Packing Checklist', count: `${packedCount}/${totalPackItems}`, icon: CheckSquare },
          { id: 'utilities', label: 'Links & Notes', count: trip.links.length + trip.notesList.length, icon: FileText },
          { id: 'photos', label: 'Photo Gallery', count: trip.photos.length, icon: ImageIcon },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TripDetailTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-orange-50 text-orange-700' : 'text-stone-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: DAY-BY-DAY ITINERARY BUILDER */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Day Selector Header & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Itinerary Activities
              </h2>
              <p className="text-xs text-stone-500">
                Click a day tab to view scheduled visits, or add a new activity
              </p>
            </div>

            <button
              onClick={() => {
                setActivityToEdit(null);
                setIsActivityModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>Add Activity</span>
            </button>
          </div>

          {/* Day Horizontal Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
                selectedDayFilter === 'all'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              All Days ({trip.activities.length})
            </button>

            {tripDays.map((dateStr, idx) => {
              const dayActivities = trip.activities.filter(a => a.date === dateStr);
              const isSelected = selectedDayFilter === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDayFilter(dateStr)}
                  className={`px-3 py-2 text-xs rounded-xl border text-left transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold">Day {idx + 1}</div>
                  <div className={`text-[11px] font-mono tabular-nums ${isSelected ? 'text-orange-100' : 'text-stone-400'}`}>
                    {formatShortDate(dateStr)} ({dayActivities.length})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Activity Cards List */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                {selectedDayFilter === 'all' 
                  ? 'No itinerary activities yet' 
                  : `No activities planned for ${formatCalendarDate(selectedDayFilter)}`}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add tours, landmark visits, food reservations, or scenic hikes to organize your schedule.
              </p>
              <button
                onClick={() => {
                  setActivityToEdit(null);
                  setIsActivityModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Activity</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`bg-white rounded-2xl border transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                    activity.isCompleted 
                      ? 'border-emerald-200/80 bg-emerald-50/20' 
                      : 'border-stone-200 hover:border-orange-200'
                  }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleActivity(activity.id)}
                      className={`mt-0.5 p-1 rounded-lg transition-colors shrink-0 ${
                        activity.isCompleted
                          ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-100'
                          : 'text-stone-400 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                      title={activity.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {activity.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold truncate ${
                          activity.isCompleted ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}>
                          {activity.title}
                        </h4>
                        
                        {/* Time & Date metadata */}
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs font-semibold text-orange-700 font-mono tabular-nums flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.startTime || 'TBD'}
                        </span>

                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-500 font-mono tabular-nums">
                          {formatShortDate(activity.date)} ({formatDayOfWeek(activity.date)})
                        </span>
                      </div>

                      {activity.location && (
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{activity.location}</span>
                        </p>
                      )}

                      {activity.notes && (
                        <p className="text-xs text-stone-600 pt-0.5 line-clamp-2">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Cost & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-stone-400 block">Est. Cost</span>
                      <span className="text-xs font-bold text-stone-800 font-mono tabular-nums">
                        {activity.estimatedCost > 0 ? `$${activity.estimatedCost.toLocaleString()}` : 'Free'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-stone-400">
                      <button
                        onClick={() => {
                          setActivityToEdit(activity);
                          setIsActivityModalOpen(true);
                        }}
                        className="p-1.5 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Activity"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT 2: EXPENSES & BUDGET TRACKER */}
      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Trip Expense Tracker
              </h2>
              <p className="text-xs text-stone-500">
                Track Estimated vs Actual expenses, monitor variances, and manage financial receipts
              </p>
            </div>

            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>Add Expense</span>
            </button>
          </div>

          {/* Running Totals & Budget Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Estimated */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Estimated Budget
              </span>
              <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums block mt-1">
                ${totalEstimatedCost.toLocaleString()}
              </span>
              <p className="text-xs text-stone-500 mt-1">Planned trip allowance</p>
            </div>

            {/* Total Actual */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Actual Spent
              </span>
              <span className="text-2xl font-extrabold text-orange-600 font-mono tabular-nums block mt-1">
                ${totalActualCost.toLocaleString()}
              </span>
              <p className="text-xs text-stone-500 mt-1">Confirmed payments & receipts</p>
            </div>

            {/* Variance */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Net Budget Variance
                </span>
                {budgetVariance <= 0 ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Under Budget
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Over Budget
                  </span>
                )}
              </div>
              <span className={`text-2xl font-extrabold font-mono tabular-nums block mt-1 ${
                budgetVariance <= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {budgetVariance >= 0 ? `+$${budgetVariance.toLocaleString()}` : `-$${Math.abs(budgetVariance).toLocaleString()}`}
              </span>
              <p className="text-xs text-stone-500 mt-1">
                {budgetVariance <= 0 
                  ? `$${Math.abs(budgetVariance).toLocaleString()} remaining in planned budget`
                  : `$${budgetVariance.toLocaleString()} over initial estimate`}
              </p>
            </div>
          </div>

          {/* Budget Utilization Progress Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700">Budget Utilization</span>
              <span className="font-mono tabular-nums text-stone-600 font-semibold">
                {Math.round(budgetUtilization)}% of planned estimate spent
              </span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization > 100 
                    ? 'bg-red-500' 
                    : budgetUtilization > 80 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>
          </div>

          {/* Category Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(['Flights', 'Accommodation', 'Food', 'Activities', 'Transit', 'Shopping', 'Misc'] as ExpenseCategory[]).map(cat => {
              const data = expensesByCategory.get(cat) || { estimated: 0, actual: 0, count: 0 };
              return (
                <div key={cat} className="bg-white p-3 rounded-xl border border-stone-200/70 text-center">
                  <span className="text-[11px] font-bold text-stone-600 truncate block">{cat}</span>
                  <span className="text-xs font-bold text-stone-900 font-mono tabular-nums block mt-1">
                    ${data.actual.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono tabular-nums block">
                    est: ${data.estimated.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Expenses Table */}
          {trip.expenses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <p className="text-xs text-stone-500">No expense records added yet.</p>
              <button
                onClick={() => {
                  setExpenseToEdit(null);
                  setIsExpenseModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg shadow-xs"
              >
                Log First Expense
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/70 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Expense Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Estimated</th>
                      <th className="py-3 px-4 text-right">Actual</th>
                      <th className="py-3 px-4 text-right">Variance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {trip.expenses.map((expense) => {
                      const variance = (expense.actualCost || 0) - (expense.estimatedCost || 0);
                      return (
                        <tr key={expense.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-stone-900 block">{expense.title}</span>
                            {expense.notes && (
                              <span className="text-[11px] text-stone-400 line-clamp-1">{expense.notes}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-stone-500 whitespace-nowrap">
                            {formatShortDate(expense.date)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-stone-600">
                            ${expense.estimatedCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-orange-900">
                            ${expense.actualCost.toLocaleString()}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono tabular-nums font-bold ${
                            variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : 'text-stone-400'
                          }`}>
                            {variance > 0 ? `+$${variance.toLocaleString()}` : variance < 0 ? `-$${Math.abs(variance).toLocaleString()}` : '$0'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setExpenseToEdit(expense);
                                setIsExpenseModalOpen(true);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-800 transition-colors mr-1"
                              title="Edit Expense"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT 3: PACKING CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Interactive Packing Checklist
              </h2>
              <p className="text-xs text-stone-500">
                Make sure you never leave essential travel documents, gear, or clothing behind
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePackAll(true)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Pack All
              </button>
              <button
                onClick={() => handlePackAll(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={handleLoadVacationChecklistTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Template</span>
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">
                Packing Progress: <span className="font-mono tabular-nums text-orange-600">{packedCount}</span> of <span className="font-mono tabular-nums">{totalPackItems}</span> items packed
              </span>
              <span className="font-mono tabular-nums font-bold text-orange-600">
                {packPercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${packPercent}%` }}
              />
            </div>
          </div>

          {/* Add Item Input Form */}
          <form onSubmit={handleAddChecklistItem} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Add item to packing list (e.g. Hiking boots, International adapter)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={newChecklistCategory}
              onChange={(e) => setNewChecklistCategory(e.target.value as ChecklistCategory)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {(['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Gear', 'General'] as ChecklistCategory[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              Add Item
            </button>
          </form>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'Clothing', 'Toiletries', 'Electronics', 'Documents', 'Gear', 'General'].map(cat => (
              <button
                key={cat}
                onClick={() => setChecklistFilter(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                  checklistFilter === cat
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* Checklist Items List */}
          {trip.checklist.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <p className="text-xs text-stone-500">Your packing list is empty.</p>
              <button
                onClick={handleLoadVacationChecklistTemplate}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg shadow-xs"
              >
                Load Vacation Essentials
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {trip.checklist
                .filter(item => checklistFilter === 'all' || item.category === checklistFilter)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      item.isPacked 
                        ? 'bg-stone-50/80 border-stone-200 text-stone-400' 
                        : 'bg-white border-stone-200 hover:border-orange-200 text-stone-800'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={item.isPacked}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-medium block truncate ${item.isPacked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                          {item.text}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {item.category}
                        </span>
                      </div>
                    </label>

                    <button
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="p-1 text-stone-300 hover:text-red-600 rounded-lg transition-colors ml-2"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT 4: USEFUL LINKS & IMPORTANT NOTES */}
      {activeTab === 'utilities' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Useful Links Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Useful Travel URLs & Reservations
                </h2>
                <p className="text-xs text-stone-500">
                  Save transit timetables, hotel confirmations, offline map links, and blogs
                </p>
              </div>

              <button
                onClick={() => {
                  setLinkToEdit(null);
                  setIsLinkModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save Link</span>
              </button>
            </div>

            {trip.links.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500">
                No travel links saved yet. Click Save Link to store booking links and guides.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trip.links.map((link) => (
                  <div
                    key={link.id}
                    className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-orange-200 transition-all shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                          {link.category}
                        </span>
                        <div className="flex items-center gap-1 text-stone-400">
                          <button
                            onClick={() => {
                              setLinkToEdit(link);
                              setIsLinkModalOpen(true);
                            }}
                            className="p-1 hover:text-stone-800 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                        {link.title}
                      </h4>
                      {link.notes && (
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                          {link.notes}
                        </p>
                      )}
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between text-xs font-semibold text-orange-600 hover:text-orange-700 pt-2 border-t border-stone-100"
                    >
                      <span className="truncate max-w-[200px]">{link.url.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Important Travel Notes Section */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Important Travel Notes & Emergency Contacts
                </h2>
                <p className="text-xs text-stone-500">
                  Emergency numbers, hotel access codes, medical info, and packing tips
                </p>
              </div>

              {!isAddingNote && (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Note</span>
                </button>
              )}
            </div>

            {/* Note Creation Form */}
            {isAddingNote && (
              <form onSubmit={handleAddNote} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-md space-y-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g. Emergency Contacts, Lodging Door Codes)"
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
                <textarea
                  rows={4}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write details, address, telephone numbers, tips..."
                  className="w-full p-3 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteTitle('');
                      setNewNoteContent('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-xs"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes Grid */}
            {trip.notesList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500">
                No custom notes created yet. Click New Note to save contact info or instructions.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trip.notesList.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-white p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                      note.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          <span>{note.title}</span>
                        </h4>

                        <div className="flex items-center gap-1 text-stone-400 shrink-0">
                          <button
                            onClick={() => handleTogglePinNote(note.id)}
                            className={`p-1 rounded hover:bg-stone-100 transition-colors ${
                              note.isPinned ? 'text-amber-500' : 'text-stone-400'
                            }`}
                            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 hover:text-red-600 rounded transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <pre className="text-xs text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {note.content}
                      </pre>
                    </div>

                    <div className="text-[10px] text-stone-400 pt-2 border-t border-stone-100">
                      Last edited {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 5: PHOTO MEMORIES & GALLERY */}
      {activeTab === 'photos' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Travel Photo Memories
              </h2>
              <p className="text-xs text-stone-500">
                Visual memories from your journey. Broken or invalid image URLs gracefully fallback to stylized destination frames.
              </p>
            </div>

            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>Add Photo</span>
            </button>
          </div>

          {trip.photos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No photo memories added yet. Add image URLs to build your photo collage!
              </p>
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg shadow-xs"
              >
                Add First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trip.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Photo with Graceful Fallback */}
                  <div 
                    onClick={() => setPreviewPhoto(photo)}
                    className="relative h-52 w-full cursor-pointer bg-stone-100 overflow-hidden"
                  >
                    <ImageWithFallback
                      src={photo.url}
                      fallbackTitle={photo.caption}
                      fallbackSubtitle={photo.location || trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      containerClassName="w-full h-full"
                    />

                    {/* Overlay Action Bar */}
                    <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPhoto(photo);
                        }}
                        className="p-2 bg-white/90 hover:bg-white text-stone-900 rounded-xl backdrop-blur-xs transition-transform hover:scale-110 shadow-sm"
                        title="View Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl backdrop-blur-xs transition-transform hover:scale-110 shadow-sm"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Caption & Location metadata */}
                  <div className="p-3 bg-white space-y-1">
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">
                      {photo.caption}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono tabular-nums">
                      <span className="truncate max-w-[120px]">{photo.location || trip.destination}</span>
                      {photo.date && <span>{formatShortDate(photo.date)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-[60vh] sm:h-[70vh] w-full bg-black flex items-center justify-center overflow-hidden">
              <ImageWithFallback
                src={previewPhoto.url}
                fallbackTitle={previewPhoto.caption}
                fallbackSubtitle={previewPhoto.location || trip.destination}
                className="w-full h-full object-contain"
                containerClassName="w-full h-full flex items-center justify-center"
              />
            </div>

            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{previewPhoto.caption}</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {previewPhoto.location} · {previewPhoto.date ? formatCalendarDate(previewPhoto.date) : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  handleDeletePhoto(previewPhoto.id);
                  setPreviewPhoto(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-red-300 hover:text-red-100 bg-red-950/60 rounded-lg border border-red-500/30 transition-colors"
              >
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        activityToEdit={activityToEdit}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        defaultDate={selectedDayFilter !== 'all' ? selectedDayFilter : trip.startDate}
        onSave={handleSaveActivity}
        onClose={() => {
          setIsActivityModalOpen(false);
          setActivityToEdit(null);
        }}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        expenseToEdit={expenseToEdit}
        tripStartDate={trip.startDate}
        onSave={handleSaveExpense}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
      />

      {/* Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        linkToEdit={linkToEdit}
        onSave={handleSaveLink}
        onClose={() => {
          setIsLinkModalOpen(false);
          setLinkToEdit(null);
        }}
      />

      {/* Photo Modal */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        tripStartDate={trip.startDate}
        onSave={handleSavePhoto}
        onClose={() => setIsPhotoModalOpen(false)}
      />

    </div>
  );
};
