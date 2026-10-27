import { Trip } from '../types/trip';
import { getInitialDemoTrips } from '../data/initialDemoTrips';

const STORAGE_KEY = 'tripnest_trips_data_v1';
const RECENTLY_VIEWED_KEY = 'tripnest_recently_viewed_v1';

export function loadTripsFromStorage(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo = getInitialDemoTrips();
      saveTripsToStorage(demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const demo = getInitialDemoTrips();
      saveTripsToStorage(demo);
      return demo;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse trips from localStorage, loading demo data fallback', error);
    return getInitialDemoTrips();
  }
}

export function saveTripsToStorage(trips: Trip[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    return true;
  } catch (error) {
    console.error('Failed to save trips to localStorage', error);
    return false;
  }
}

export function resetStorageToDemo(): Trip[] {
  try {
    const demo = getInitialDemoTrips();
    saveTripsToStorage(demo);
    return demo;
  } catch (error) {
    console.error('Failed to reset storage', error);
    return getInitialDemoTrips();
  }
}

export function loadRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewedId(tripId: string): void {
  try {
    const existing = loadRecentlyViewedIds().filter(id => id !== tripId);
    const updated = [tripId, ...existing].slice(0, 5);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function exportBackupJson(trips: Trip[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trips, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tripnest_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
