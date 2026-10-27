import React, { useState, useEffect } from 'react';
import { Trip } from '../types/trip';
import { ImageWithFallback } from './ImageWithFallback';
import { isValidDateRange, getTodayDateString, getDateOffsetDays } from '../utils/dateUtils';
import { X, Calendar, MapPin, Image as ImageIcon, Sparkles, FileText } from 'lucide-react';

interface TripModalProps {
  isOpen: boolean;
  tripToEdit?: Trip | null;
  onSave: (tripData: Omit<Trip, 'id' | 'createdAt' | 'activities' | 'expenses' | 'checklist' | 'links' | 'notesList' | 'photos'>) => void;
  onClose: () => void;
}

const PRESET_COVERS = [
  { name: 'Kyoto', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Amalfi', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Alps', url: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Paris', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
];

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  tripToEdit,
  onSave,
  onClose,
}) => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (tripToEdit) {
      setDestination(tripToEdit.destination);
      setStartDate(tripToEdit.startDate);
      setEndDate(tripToEdit.endDate);
      setNotes(tripToEdit.notes || '');
      setCoverImageUrl(tripToEdit.coverImageUrl || '');
      setIsArchived(tripToEdit.isArchived || false);
    } else {
      setDestination('');
      const today = getTodayDateString();
      setStartDate(today);
      setEndDate(getDateOffsetDays(7));
      setNotes('');
      setCoverImageUrl(PRESET_COVERS[0].url);
      setIsArchived(false);
    }
    setErrors({});
  }, [tripToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!destination.trim()) {
      newErrors.destination = 'Destination name is required.';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required.';
    }

    if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
      newErrors.endDate = 'Trip End Date cannot be before the Start Date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      destination: destination.trim(),
      startDate,
      endDate,
      notes: notes.trim(),
      coverImageUrl: coverImageUrl.trim(),
      isArchived,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {tripToEdit ? 'Edit Trip Details' : 'Plan a New Trip'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Set destination, travel dates, and visual cover
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Destination <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto & Nara, Japan or Reykjavik, Iceland"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.destination ? 'border-red-500' : 'border-stone-300'
                }`}
              />
            </div>
            {errors.destination && (
              <p className="text-xs text-red-600 mt-1">{errors.destination}</p>
            )}
          </div>

          {/* Dates (Start & End) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Start Date <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.startDate ? 'border-red-500' : 'border-stone-300'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                End Date <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.endDate ? 'border-red-500' : 'border-stone-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Cover Image & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Cover Photo URL
              </label>
              <span className="text-[11px] text-stone-400">Supports any valid image URL</span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-500 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-orange-500" /> Presets:
              </span>
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setCoverImageUrl(preset.url)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
                    coverImageUrl === preset.url
                      ? 'bg-orange-50 text-orange-700 border-orange-300 font-semibold'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Live Preview Box with Fallback */}
            {coverImageUrl && (
              <div className="mt-3">
                <p className="text-[11px] font-medium text-stone-500 mb-1">Live Image Preview:</p>
                <div className="h-28 rounded-xl overflow-hidden border border-stone-200 shadow-inner">
                  <ImageWithFallback
                    src={coverImageUrl}
                    fallbackTitle={destination || 'Destination'}
                    fallbackSubtitle="Cover preview"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Trip Overview & Highlights (Optional)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief summary of highlights, key goals, vibe of the trip..."
                className="w-full p-3 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Archive Status Toggle (if editing) */}
          {tripToEdit && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={(e) => setIsArchived(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                />
                <span className="text-xs font-medium text-stone-700">
                  Archive this trip (hides from active upcoming dashboard views)
                </span>
              </label>
            </div>
          )}

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
              {tripToEdit ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
