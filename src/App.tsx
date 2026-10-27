import React, { useState, useEffect } from 'react';
import { Trip } from './types/trip';
import { 
  loadTripsFromStorage, 
  saveTripsToStorage, 
  resetStorageToDemo, 
  loadRecentlyViewedIds, 
  recordRecentlyViewedId,
  exportBackupJson 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TripDetailView } from './components/TripDetailView';
import { TripModal } from './components/TripModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTripsFromStorage());
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => loadRecentlyViewedIds());

  // Trip Modal
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);

  // Confirm Modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save trips to localStorage whenever updated
  useEffect(() => {
    saveTripsToStorage(trips);
  }, [trips]);

  // Selected trip object
  const selectedTrip = trips.find(t => t.id === selectedTripId) || null;

  // Handle selecting a trip
  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    recordRecentlyViewedId(tripId);
    setRecentlyViewedIds(loadRecentlyViewedIds());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle returning to dashboard
  const handleBackToDashboard = () => {
    setSelectedTripId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Create Trip modal
  const handleOpenNewTrip = () => {
    setTripToEdit(null);
    setIsTripModalOpen(true);
  };

  // Open Edit Trip modal
  const handleOpenEditTrip = (trip: Trip) => {
    setTripToEdit(trip);
    setIsTripModalOpen(true);
  };

  // Save created or edited trip
  const handleSaveTrip = (
    tripData: Omit<Trip, 'id' | 'createdAt' | 'activities' | 'expenses' | 'checklist' | 'links' | 'notesList' | 'photos'>
  ) => {
    if (tripToEdit) {
      const updatedTrips = trips.map(t =>
        t.id === tripToEdit.id ? { ...t, ...tripData } : t
      );
      setTrips(updatedTrips);
    } else {
      const newTrip: Trip = {
        ...tripData,
        id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        activities: [],
        expenses: [],
        checklist: [],
        links: [],
        notesList: [],
        photos: [],
      };
      setTrips([newTrip, ...trips]);
      handleSelectTrip(newTrip.id);
    }
    setIsTripModalOpen(false);
    setTripToEdit(null);
  };

  // Delete trip with confirmation
  const handleDeleteTripRequest = (tripId: string) => {
    const targetTrip = trips.find(t => t.id === tripId);
    setConfirmConfig({
      isOpen: true,
      title: `Delete "${targetTrip?.destination || 'Trip'}"?`,
      message: 'This will permanently delete this trip, including all day itineraries, expense records, packing items, and saved photos. This action cannot be undone.',
      confirmLabel: 'Delete Trip',
      isDestructive: true,
      onConfirm: () => {
        const remaining = trips.filter(t => t.id !== tripId);
        setTrips(remaining);
        if (selectedTripId === tripId) {
          setSelectedTripId(null);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Toggle archive
  const handleToggleArchive = (tripId: string) => {
    const updated = trips.map(t => t.id === tripId ? { ...t, isArchived: !t.isArchived } : t);
    setTrips(updated);
  };

  // Reset demo trips with confirmation
  const handleResetDemoRequest = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset to Sample Trips?',
      message: 'This will replace your current trips with the sample travel itineraries (Kyoto, Amalfi Coast, and Banff). Any unsaved personal trips will be overwritten.',
      confirmLabel: 'Reset Data',
      isDestructive: false,
      onConfirm: () => {
        const demo = resetStorageToDemo();
        setTrips(demo);
        setSelectedTripId(null);
        setRecentlyViewedIds([]);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Update specific trip from detail view
  const handleUpdateTrip = (updatedTrip: Trip) => {
    const updatedList = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
    setTrips(updatedList);
  };

  // Export JSON backup
  const handleExportData = () => {
    exportBackupJson(trips);
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrips(parsed);
          setSelectedTripId(null);
        } else {
          alert('Invalid backup file format. Expected a list of trips.');
        }
      } catch (err) {
        console.error('Failed to parse imported JSON', err);
        alert('Could not read JSON file. Please ensure it is a valid TripNest backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        onNewTrip={handleOpenNewTrip}
        onResetDemo={handleResetDemoRequest}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onSelectTripView={handleBackToDashboard}
        selectedTripDestination={selectedTrip?.destination}
        activeView={selectedTrip ? 'trip-detail' : 'dashboard'}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {selectedTrip ? (
          <TripDetailView
            trip={selectedTrip}
            onBack={handleBackToDashboard}
            onUpdateTrip={handleUpdateTrip}
            onEditTripDetails={() => handleOpenEditTrip(selectedTrip)}
            onDeleteTrip={() => handleDeleteTripRequest(selectedTrip.id)}
            onToggleArchive={() => handleToggleArchive(selectedTrip.id)}
          />
        ) : (
          <DashboardView
            trips={trips}
            recentlyViewedIds={recentlyViewedIds}
            onSelectTrip={handleSelectTrip}
            onNewTrip={handleOpenNewTrip}
            onEditTrip={handleOpenEditTrip}
            onDeleteTrip={handleDeleteTripRequest}
            onToggleArchive={handleToggleArchive}
            onResetDemo={handleResetDemoRequest}
          />
        )}
      </main>

      {/* Editorial Clean Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-800">TripNest</span>
            <span>·</span>
            <span>Travel Itinerary & Expense Planner</span>
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Client-side storage</span>
            <span>·</span>
            <span>Offline capable</span>
            <span>·</span>
            <button
              onClick={handleResetDemoRequest}
              className="hover:text-orange-600 transition-colors"
            >
              Reset Sample Trips
            </button>
          </div>
        </div>
      </footer>

      {/* Trip Modal (Create / Edit) */}
      <TripModal
        isOpen={isTripModalOpen}
        tripToEdit={tripToEdit}
        onSave={handleSaveTrip}
        onClose={() => {
          setIsTripModalOpen(false);
          setTripToEdit(null);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
