import React, { useState, useEffect } from 'react';
import { TravelLink, LinkCategory } from '../types/trip';
import { X, ExternalLink, Tag } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  linkToEdit?: TravelLink | null;
  onSave: (link: Omit<TravelLink, 'id'>) => void;
  onClose: () => void;
}

const CATEGORIES: LinkCategory[] = ['Booking', 'Guide', 'Map', 'Transit', 'Reservation', 'Other'];

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  linkToEdit,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<LinkCategory>('Booking');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (linkToEdit) {
      setTitle(linkToEdit.title);
      setUrl(linkToEdit.url);
      setCategory(linkToEdit.category);
      setNotes(linkToEdit.notes || '');
    } else {
      setTitle('');
      setUrl('https://');
      setCategory('Booking');
      setNotes('');
    }
    setError(null);
  }, [linkToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this travel link.');
      return;
    }
    if (!url.trim() || url === 'https://') {
      setError('Please provide a valid URL.');
      return;
    }

    onSave({
      title: title.trim(),
      url: url.trim(),
      category,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {linkToEdit ? 'Edit Travel Link' : 'Save Useful Travel Link'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Store reservations, blogs, transit schedules, and maps
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Link Title <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ferry Timetable, Airbnb Check-in, Guide"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Web Address (URL) <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <ExternalLink className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LinkCategory)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Notes or Access Code (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Password or platform info..."
              className="w-full p-2.5 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Save Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
