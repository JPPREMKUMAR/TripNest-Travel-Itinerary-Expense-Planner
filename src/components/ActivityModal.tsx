import React, { useState, useEffect } from 'react';
import { Activity } from '../types/trip';
import { isDateWithinRange, formatCalendarDate, getDatesBetween } from '../utils/dateUtils';
import { X, Clock, MapPin, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  activityToEdit?: Activity | null;
  tripStartDate: string;
  tripEndDate: string;
  defaultDate?: string;
  onSave: (activity: Omit<Activity, 'id'>) => void;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  activityToEdit,
  tripStartDate,
  tripEndDate,
  defaultDate,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<string>('0');
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = getDatesBetween(tripStartDate, tripEndDate);

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setLocation(activityToEdit.location || '');
      setDate(activityToEdit.date);
      setStartTime(activityToEdit.startTime || '');
      setNotes(activityToEdit.notes || '');
      setEstimatedCost(activityToEdit.estimatedCost.toString());
      setIsCompleted(activityToEdit.isCompleted || false);
    } else {
      setTitle('');
      setLocation('');
      // Default to provided date or trip start date
      const initialDate = defaultDate && isDateWithinRange(defaultDate, tripStartDate, tripEndDate) 
        ? defaultDate 
        : tripStartDate;
      setDate(initialDate);
      setStartTime('09:00');
      setNotes('');
      setEstimatedCost('0');
      setIsCompleted(false);
    }
    setError(null);
  }, [activityToEdit, isOpen, tripStartDate, tripEndDate, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide an activity title.');
      return;
    }

    if (!date) {
      setError('Please select an activity date.');
      return;
    }

    // STRICT VALIDATION: Activity date must fall strictly within trip dates
    if (!isDateWithinRange(date, tripStartDate, tripEndDate)) {
      setError(
        `Activity date must fall strictly within the trip window (${formatCalendarDate(tripStartDate)} to ${formatCalendarDate(tripEndDate)}).`
      );
      return;
    }

    const costNum = parseFloat(estimatedCost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Estimated cost must be a valid non-negative number.');
      return;
    }

    onSave({
      title: title.trim(),
      location: location.trim(),
      date,
      startTime: startTime.trim(),
      notes: notes.trim(),
      estimatedCost: costNum,
      isCompleted,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {activityToEdit ? 'Edit Itinerary Activity' : 'Add Activity to Itinerary'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Trip window: {formatCalendarDate(tripStartDate)} – {formatCalendarDate(tripEndDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Activity Title <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunrise Hike, Museum Tour, Dinner Reservation"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Date <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  min={tripStartDate}
                  max={tripEndDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Must be between {tripStartDate} and {tripEndDate}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Location & Estimated Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Location / Venue
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Gion District or Louvre Museum"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estimated Cost ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 tabular-nums font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Activity Notes & Booking Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Confirmation code, ticket requirements, packing tip, meeting point..."
              className="w-full p-3 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Completed Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
              />
              <span className="text-xs font-medium text-stone-700">
                Mark as completed
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {activityToEdit ? 'Save Activity' : 'Add Activity'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
