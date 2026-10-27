import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, RotateCcw, Compass, MapPin } from 'lucide-react';

interface NavbarProps {
  onNewTrip: () => void;
  onResetDemo: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectTripView?: () => void;
  selectedTripDestination?: string;
  activeView: 'dashboard' | 'trip-detail';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewTrip,
  onResetDemo,
  onExportData,
  onImportData,
  onSelectTripView,
  selectedTripDestination,
  activeView,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Zone with Mountain-and-Sun inline SVG */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onSelectTripView}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
          >
            {/* Mountain and Sun Inline SVG */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-1.5 shadow-sm shadow-orange-500/20 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                {/* Sun */}
                <circle cx="17" cy="7" r="3" fill="#FEF08A" stroke="none" />
                {/* Sun rays */}
                <path d="M17 2.5V3.5M20.5 7H21.5M19.8 4.2L19.1 4.9M14.2 4.2L14.9 4.9" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
                {/* Mountains */}
                <path
                  d="M2.5 19.5L9.5 8.5L14 15.5L16.5 12L21.5 19.5H2.5Z"
                  fill="white"
                  fillOpacity="0.95"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Mountain Ridge Accent */}
                <path
                  d="M9.5 8.5L12 19.5M16.5 12L18.5 19.5"
                  stroke="#EA580C"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 flex items-center gap-1">
                Trip<span className="text-orange-600">Nest</span>
              </span>
              <span className="sr-only">Travel Itinerary & Expense Planner</span>
            </div>
          </button>

          {/* Breadcrumb if inside Trip Detail */}
          {activeView === 'trip-detail' && selectedTripDestination && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-200 text-sm">
              <button
                onClick={onSelectTripView}
                className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 font-medium"
              >
                <Compass className="w-4 h-4 text-stone-400" />
                <span>Trips</span>
              </button>
              <span className="text-stone-300">/</span>
              <span className="font-semibold text-stone-800 flex items-center gap-1 max-w-[220px] md:max-w-xs truncate">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="truncate">{selectedTripDestination}</span>
              </span>
            </div>
          )}
        </div>

        {/* Center / Navigation Zone */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={onSelectTripView}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-orange-600 ${activeView === 'dashboard' ? 'text-orange-600 font-semibold' : ''}`}
          >
            My Trips
          </button>
          <span className="text-stone-300">·</span>
          <span className="text-stone-400 text-xs font-normal">
            Client-Side & Offline Ready
          </span>
        </div>

        {/* Right Zone: Primary CTA & Settings Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Data Management dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Storage & Data Options"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <span className="text-xs font-semibold px-1">Data</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-stone-100 mb-1">
                  <p className="text-xs font-semibold text-stone-900">Workspace Data</p>
                  <p className="text-[11px] text-stone-500">Stored in browser localStorage</p>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onExportData();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Export Trips Backup (JSON)</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>Restore from JSON</span>
                </button>

                <div className="border-t border-stone-100 my-1" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onResetDemo();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset to Demo Trips</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportData}
            accept=".json"
            className="hidden"
          />

          {/* Primary Action Button */}
          <button
            onClick={onNewTrip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-600/20 transition-all whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>New Trip</span>
          </button>
        </div>

      </div>
    </header>
  );
};
