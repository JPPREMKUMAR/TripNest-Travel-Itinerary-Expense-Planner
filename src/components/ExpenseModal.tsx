import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory } from '../types/trip';
import { X, DollarSign, Calendar, Tag, AlertCircle } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  expenseToEdit?: Expense | null;
  tripStartDate: string;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onClose: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Flights',
  'Accommodation',
  'Food',
  'Activities',
  'Transit',
  'Shopping',
  'Misc',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  expenseToEdit,
  tripStartDate,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Activities');
  const [date, setDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [actualCost, setActualCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
      setEstimatedCost(expenseToEdit.estimatedCost.toString());
      setActualCost(expenseToEdit.actualCost.toString());
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('Activities');
      setDate(tripStartDate || new Date().toISOString().slice(0, 10));
      setEstimatedCost('0');
      setActualCost('0');
      setNotes('');
    }
    setError(null);
  }, [expenseToEdit, isOpen, tripStartDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide an expense title.');
      return;
    }

    const est = parseFloat(estimatedCost);
    const act = parseFloat(actualCost);

    if (isNaN(est) || est < 0) {
      setError('Estimated cost must be a non-negative number.');
      return;
    }

    if (isNaN(act) || act < 0) {
      setError('Actual cost must be a non-negative number.');
      return;
    }

    onSave({
      title: title.trim(),
      category,
      date: date || tripStartDate,
      estimatedCost: est,
      actualCost: act,
      notes: notes.trim(),
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
              {expenseToEdit ? 'Edit Expense Record' : 'Add Trip Expense'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Track estimated budget vs actual spend
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
              Expense Item Description <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flight to Rome, Ryokan Lodging, Shinkansen Pass"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Estimated vs Actual Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50/70 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estimated Amount ($)
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
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tabular-nums font-semibold"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Planned budget</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Actual Amount Paid ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tabular-nums font-semibold text-orange-900"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Final receipt or booked cost</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Payment & Receipt Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid with Chase Sapphire, split with Sarah, non-refundable..."
              className="w-full p-3 text-sm rounded-lg border border-stone-300 bg-stone-50/30 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
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
              {expenseToEdit ? 'Save Expense' : 'Add Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
