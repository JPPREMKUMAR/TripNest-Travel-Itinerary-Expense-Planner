import React, { useState } from 'react';
import { PhotoItem } from '../types/trip';
import { ImageWithFallback } from './ImageWithFallback';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface PhotoModalProps {
  isOpen: boolean;
  onSave: (photo: Omit<PhotoItem, 'id'>) => void;
  onClose: () => void;
  tripStartDate: string;
}

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Scenic Vista', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sunset Coastal', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Historic Streets', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
  { label: 'Local Food', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
];

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onSave,
  onClose,
  tripStartDate,
}) => {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(tripStartDate || new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide an image URL.');
      return;
    }

    onSave({
      url: url.trim(),
      caption: caption.trim() || 'Travel Memory',
      location: location.trim(),
      date,
    });
    setUrl('');
    setCaption('');
    setLocation('');
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
            <h2 className="text-lg font-bold text-stone-900">Add Photo to Gallery</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Paste an image URL to capture travel memories
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
              Image URL <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>

            {/* Quick Sample Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-500 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-orange-500" /> Presets:
              </span>
              {SAMPLE_PHOTO_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setUrl(p.url)}
                  className="px-2 py-0.5 text-[11px] rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            {url && (
              <div className="mt-3">
                <p className="text-[11px] font-medium text-stone-500 mb-1">Preview:</p>
                <div className="h-32 rounded-xl overflow-hidden border border-stone-200">
                  <ImageWithFallback
                    src={url}
                    fallbackTitle={caption || 'Photo Preview'}
                    fallbackSubtitle="Sample photo"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Caption / Description
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Sunset over the cliffs, delicious local ramen"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Arashiyama, Kyoto"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Date Taken
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
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
              Add Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
