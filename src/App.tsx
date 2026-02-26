import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check, Trash2, Factory, TrendingUp, AlertCircle, Settings, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

type KPI = {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
};

const initialKPIs: KPI[] = [
  { id: '1', name: 'Kiln Feed', value: 380, target: 400, unit: 't/h' },
  { id: '2', name: 'Cement Feed', value: 145, target: 150, unit: 't/h' },
  { id: '3', name: 'MTBF Kiln', value: 320, target: 400, unit: 'hrs' },
  { id: '4', name: 'MTBF Cement', value: 280, target: 300, unit: 'hrs' },
];

export default function App() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setError("Firebase configuration is missing. Please set up your environment variables.");
      setLoading(false);
      return;
    }

    const kpisRef = collection(db, 'kpis');
    
    // Seed initial data if empty
    const seedData = async () => {
      try {
        const snapshot = await getDocs(kpisRef);
        if (snapshot.empty) {
          for (const kpi of initialKPIs) {
            await setDoc(doc(kpisRef, kpi.id), kpi);
          }
        }
      } catch (err) {
        console.error("Error seeding data:", err);
        setError("Failed to connect to Firebase. Check your configuration and rules.");
      }
    };
    
    seedData();

    const unsubscribe = onSnapshot(kpisRef, (snapshot) => {
      const kpiData: KPI[] = [];
      snapshot.forEach((doc) => {
        kpiData.push({ id: doc.id, ...doc.data() } as KPI);
      });
      // Sort by name
      kpiData.sort((a, b) => a.name.localeCompare(b.name));
      setKpis(kpiData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error(err);
      setError("Failed to read from Firebase. Check your configuration and rules.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (kpi: KPI) => {
    setEditingId(kpi.id);
    setEditForm(kpi);
  };

  const handleSave = async () => {
    if (editForm && db) {
      try {
        await setDoc(doc(db, 'kpis', editForm.id), editForm);
        setEditingId(null);
        setEditForm(null);
      } catch (err) {
        console.error("Error saving document: ", err);
        alert("Failed to save KPI.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'kpis', id));
      } catch (err) {
        console.error("Error deleting document: ", err);
        alert("Failed to delete KPI.");
      }
    }
  };

  const handleAdd = async () => {
    if (!db) return;
    const newKpi = {
      name: 'New KPI',
      value: 0,
      target: 100,
      unit: 'unit'
    };
    try {
      const docRef = await addDoc(collection(db, 'kpis'), newKpi);
      const kpiWithId = { id: docRef.id, ...newKpi };
      setEditingId(docRef.id);
      setEditForm(kpiWithId);
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to add KPI.");
    }
  };

  const calculateProgress = (value: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.max((value / target) * 100, 0), 100);
  };

  if (!db || error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Firebase Setup Required</h2>
          <p className="text-slate-600 mb-6 text-sm">
            {error || "To enable real-time syncing, you need to connect this app to a Firebase project."}
          </p>
          <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
            <p className="font-semibold mb-2 text-slate-900">Required Environment Variables:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>VITE_FIREBASE_APP_ID</li>
            </ul>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Add these to your environment variables to continue.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin text-indigo-600">
          <Factory size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
              <Factory size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Cement Plant Operations</h1>
          </div>
          <button 
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add KPI
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {kpis.map(kpi => {
              const isEditing = editingId === kpi.id;
              const progress = calculateProgress(kpi.value, kpi.target);
              const isWarning = progress < 80;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={kpi.id} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative group transition-all hover:shadow-md h-[280px]"
                >
                  {isEditing ? (
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">KPI Name</label>
                        <input 
                          type="text" 
                          value={editForm?.name || ''}
                          onChange={e => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g. Kiln Feed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Current</label>
                          <input 
                            type="number" 
                            value={editForm?.value || 0}
                            onChange={e => setEditForm(prev => prev ? {...prev, value: Number(e.target.value)} : null)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Target</label>
                          <input 
                            type="number" 
                            value={editForm?.target || 0}
                            onChange={e => setEditForm(prev => prev ? {...prev, target: Number(e.target.value)} : null)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Unit</label>
                        <input 
                          type="text" 
                          value={editForm?.unit || ''}
                          onChange={e => setEditForm(prev => prev ? {...prev, unit: e.target.value} : null)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g. t/h"
                        />
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => handleDelete(kpi.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete KPI"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSave}
                            className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Check size={16} /> Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-md text-slate-500">
                            {kpi.name.toLowerCase().includes('mtbf') ? <Settings size={16} /> : <TrendingUp size={16} />}
                          </div>
                          <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">{kpi.name}</h3>
                        </div>
                        <button 
                          onClick={() => handleEdit(kpi)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-1 mb-8">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-light tracking-tight text-slate-900">
                            {kpi.value}
                          </span>
                          <span className="text-lg font-medium text-slate-500">
                            {kpi.unit}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1.5">
                          <span>Target:</span>
                          <span className="font-medium text-slate-700">{kpi.target} {kpi.unit}</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</span>
                          <span className={`text-xs font-bold ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {isWarning && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md">
                            <AlertCircle size={14} />
                            <span>Below target threshold</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
