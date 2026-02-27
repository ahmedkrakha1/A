import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Target, Settings, TrendingUp, Award, Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';

type BoardData = {
  date: string;
  title: string;
  sections: SectionData[];
}

type SectionData = {
  id: string;
  column: number;
  title: string;
  icon: string;
  items: ItemData[];
}

type ItemData = {
  id: string;
  text: string;
  hasKpi: boolean;
  value: number;
  target: number;
  unit: string;
}

const initialData: BoardData = {
  date: "27-Feb 2026",
  title: "Day to day operations – KNOW OUR PRIORITY",
  sections: [
    {
      id: "s1",
      column: 1,
      title: "HEALTH, SAFETY & ENVIRONMENT",
      icon: "ShieldAlert",
      items: [
        { id: "i1", text: "Ensure ZERO harm", hasKpi: false, value: 0, target: 0, unit: "" },
        { id: "i2", text: "Ensure NO JOBs without SWI / RA", hasKpi: false, value: 0, target: 0, unit: "" },
        { id: "i3", text: "Report any Safety & Environmental Incident within 24 hrs in iCare", hasKpi: false, value: 0, target: 0, unit: "" },
        { id: "i4", text: "Any visible dust from main stack or any other process areas, highlight & report to concern team.", hasKpi: false, value: 0, target: 0, unit: "" },
      ]
    },
    {
      id: "s2",
      column: 1,
      title: "Role Specific (Shift CO. CROs & Inspector)",
      icon: "Users",
      items: [
        { id: "i5", text: "Report / update all the stoppage in TIS before you left", hasKpi: false, value: 0, target: 0, unit: "" },
        { id: "i6", text: "Ensure 100% compliance of 1st level inspection according to the schedule", hasKpi: true, value: 100, target: 100, unit: "%" },
        { id: "i7", text: "Ensure agreed KPIs are achieved", hasKpi: false, value: 0, target: 0, unit: "" },
      ]
    },
    {
      id: "s3",
      column: 2,
      title: "Our Priorities",
      icon: "Target",
      items: [
        { id: "i8", text: "ZERO HSE Incident", hasKpi: false, value: 0, target: 0, unit: "" },
        { id: "i9", text: "Stable operation of kiln with > 100% PRI", hasKpi: true, value: 100, target: 100, unit: "%" },
        { id: "i10", text: "TSR > 35%", hasKpi: true, value: 35, target: 35, unit: "%" },
        { id: "i11", text: "STEC & SEEC according to the budget", hasKpi: false, value: 0, target: 0, unit: "" },
      ]
    },
    {
      id: "s4",
      column: 2,
      title: "Equipment Operations",
      icon: "Settings",
      items: [
        { id: "i12", text: "Raw Mill\n• Optimize Mill Operations to achieve > 590 tph feed rate", hasKpi: true, value: 590, target: 590, unit: "tph" },
        { id: "i13", text: "Kiln-Cooler\n• Keep the Kiln feed 513 tph by ensuring the stability of the kiln, feel free to reduce KF to prevent kiln stoppage/ kiln flush", hasKpi: true, value: 513, target: 513, unit: "tph" },
        { id: "i14", text: "• Ensure optimum operations of the cooler to ensure Clinker temperature < 170 deg C", hasKpi: true, value: 170, target: 170, unit: "deg C" },
        { id: "i15", text: "Cement Mills\n• Ensure optimum operation of the CMs according to type of Product and agreed quality targets", hasKpi: false, value: 0, target: 0, unit: "" },
      ]
    },
    {
      id: "s5",
      column: 3,
      title: "TSR",
      icon: "TrendingUp",
      items: [
        { id: "i16", text: "Ensure minimum 35% TSR by ensuring the below:", hasKpi: true, value: 35, target: 35, unit: "%" },
        { id: "i17", text: "- RDF feed rate: 6 tph", hasKpi: true, value: 6, target: 6, unit: "tph" },
        { id: "i18", text: "- Shredded tire: 7+3 tph", hasKpi: true, value: 10, target: 10, unit: "tph" },
        { id: "i19", text: "- Sludge at 22 - 23% speed", hasKpi: true, value: 22, target: 23, unit: "%" },
        { id: "i20", text: "Ensure feeding of CD based on availability / delivery by EGA", hasKpi: false, value: 0, target: 0, unit: "" },
        { id: "i21", text: "Ensure effective operation of HME system whenever HM Cl > 1.7%", hasKpi: true, value: 1.7, target: 1.7, unit: "%" },
      ]
    },
    {
      id: "s6",
      column: 3,
      title: "CMs and Quality",
      icon: "Award",
      items: [
        { id: "i22", text: "Maintain Raw mill Sieve 16 -17 % @ 90 μm", hasKpi: true, value: 16, target: 17, unit: "%" },
        { id: "i23", text: "Ensure Clinker free lime within 1.5 -2%", hasKpi: true, value: 1.5, target: 2, unit: "%" },
        { id: "i24", text: "Ensure fine coal sieve within 9 -11% at 90 μm", hasKpi: true, value: 9, target: 11, unit: "%" },
      ]
    }
  ]
};

const IconMap: Record<string, React.ElementType> = {
  ShieldAlert,
  Users,
  Target,
  Settings,
  TrendingUp,
  Award
};

export default function App() {
  const [data, setData] = useState<BoardData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boardRef = ref(db, 'board/main');
    const unsubscribe = onValue(boardRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(boardRef, initialData);
      } else {
        setData(snapshot.val());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (data) {
      await set(ref(db, 'board/main'), data);
      setEditMode(false);
    }
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<ItemData>) => {
    if (!data) return;
    setData({
      ...data,
      sections: data.sections.map(s => 
        s.id === sectionId 
          ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : s
      )
    });
  };

  const addItem = (sectionId: string) => {
    if (!data) return;
    const newItem: ItemData = {
      id: Date.now().toString(),
      text: "New Item",
      hasKpi: false,
      value: 0,
      target: 0,
      unit: ""
    };
    setData({
      ...data,
      sections: data.sections.map(s => 
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    });
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (!data) return;
    setData({
      ...data,
      sections: data.sections.map(s => 
        s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
      )
    });
  };

  const addSection = (column: number) => {
    if (!data) return;
    const newSection: SectionData = {
      id: Date.now().toString(),
      column,
      title: "New Section",
      icon: "Settings",
      items: []
    };
    setData({
      ...data,
      sections: [...data.sections, newSection]
    });
  };

  const removeSection = (sectionId: string) => {
    if (!data) return;
    if (window.confirm("Are you sure you want to delete this entire section?")) {
      setData({
        ...data,
        sections: data.sections.filter(s => s.id !== sectionId)
      });
    }
  };

  if (loading || !data) {
    return <div className="min-h-screen bg-[#e2e8f0] flex items-center justify-center"><div className="animate-spin text-slate-500"><Settings size={32} /></div></div>;
  }

  const columns = [1, 2, 3];

  return (
    <div className="min-h-screen bg-[#e2e8f0] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto bg-[#f1f5f9] shadow-2xl rounded-xl overflow-hidden border border-slate-300">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-300 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {editMode ? (
              <input 
                className="text-3xl font-light text-slate-800 border-b border-slate-300 focus:outline-none bg-transparent w-[600px]"
                value={data.title}
                onChange={e => setData({...data, title: e.target.value})}
              />
            ) : (
              <h1 className="text-3xl font-light text-slate-800 tracking-wide">{data.title}</h1>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-[#60a5fa] text-slate-900 px-6 py-2 text-lg font-medium rounded-sm">
              {editMode ? (
                <input 
                  className="bg-transparent border-b border-slate-800 focus:outline-none w-32 text-center"
                  value={data.date}
                  onChange={e => setData({...data, date: e.target.value})}
                />
              ) : (
                data.date
              )}
            </div>
            <button 
              onClick={editMode ? handleSave : () => setEditMode(true)}
              className={`p-2 rounded-full transition-colors ${editMode ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              title={editMode ? "Save Changes" : "Edit Dashboard"}
            >
              {editMode ? <Save size={24} /> : <Edit2 size={24} />}
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {columns.map(colNum => (
            <div key={colNum} className="flex flex-col gap-8">
              {data.sections.filter(s => s.column === colNum).map(section => {
                const Icon = IconMap[section.icon] || Settings;
                return (
                  <div key={section.id} className="flex flex-col">
                    {/* Chevron Header */}
                    <div 
                      className="bg-[#1a1c29] text-white p-3 pl-4 relative mb-4 flex items-center gap-3" 
                      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)' }}
                    >
                      <Icon size={24} className="text-slate-300" />
                      {editMode ? (
                        <>
                          <input 
                            className="text-lg font-bold tracking-wide bg-transparent border-b border-slate-500 focus:outline-none w-full mr-12"
                            value={section.title}
                            onChange={e => {
                              setData({
                                ...data,
                                sections: data.sections.map(s => s.id === section.id ? {...s, title: e.target.value} : s)
                              });
                            }}
                          />
                          <button 
                            onClick={() => removeSection(section.id)}
                            className="absolute right-8 text-red-400 hover:text-red-300 p-1"
                            title="Delete Section"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <h2 className="text-lg font-bold tracking-wide">{section.title}</h2>
                      )}
                    </div>

                    {/* Items */}
                    <ul className="space-y-4 pl-2">
                      {section.items.map(item => {
                        const maxValue = Math.max(item.value, item.target);
                        const currentHeight = maxValue === 0 ? 0 : (item.value / maxValue) * 100;
                        const targetHeight = maxValue === 0 ? 0 : (item.target / maxValue) * 100;

                        return (
                          <li key={item.id} className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-4 text-sm text-slate-800">
                              <div className="flex items-start gap-2 flex-1">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                                {editMode ? (
                                  <textarea 
                                    className="w-full p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]" 
                                    value={item.text} 
                                    onChange={e => updateItem(section.id, item.id, { text: e.target.value })}
                                  />
                                ) : (
                                  <span className="leading-relaxed whitespace-pre-line">{item.text}</span>
                                )}
                              </div>
                              
                              {item.hasKpi && !editMode && (
                                <div className="flex items-center gap-3 shrink-0 bg-white p-2 rounded shadow-sm border border-slate-200">
                                  <div className="text-right">
                                    <div className="font-bold text-lg leading-none text-slate-900">{item.value}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">tgt: {item.target} {item.unit}</div>
                                  </div>
                                  <div className="flex items-end gap-1 h-10 w-8 border-b border-slate-400 justify-center pb-0.5">
                                    <div className="w-2.5 bg-orange-500 rounded-t-sm transition-all" style={{ height: `${targetHeight}%`, minHeight: '2px' }} title={`Target: ${item.target}`} />
                                    <div className="w-2.5 bg-blue-500 rounded-t-sm transition-all" style={{ height: `${currentHeight}%`, minHeight: '2px' }} title={`Current: ${item.value}`} />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {editMode && (
                              <div className="ml-3.5 bg-slate-200 p-3 rounded-md flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2 text-sm font-medium">
                                    <input 
                                      type="checkbox" 
                                      checked={item.hasKpi}
                                      onChange={e => updateItem(section.id, item.id, { hasKpi: e.target.checked })}
                                    />
                                    Show KPI Bars
                                  </label>
                                  <button onClick={() => removeItem(section.id, item.id)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                
                                {item.hasKpi && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-xs text-slate-500 mb-1">Current</label>
                                      <input type="number" className="w-full p-1 text-sm border rounded" value={item.value} onChange={e => updateItem(section.id, item.id, { value: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-500 mb-1">Target</label>
                                      <input type="number" className="w-full p-1 text-sm border rounded" value={item.target} onChange={e => updateItem(section.id, item.id, { target: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-500 mb-1">Unit</label>
                                      <input type="text" className="w-full p-1 text-sm border rounded" value={item.unit} onChange={e => updateItem(section.id, item.id, { unit: e.target.value })} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {editMode && (
                      <button 
                        onClick={() => addItem(section.id)}
                        className="mt-4 ml-3.5 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Plus size={16} /> Add Item
                      </button>
                    )}
                  </div>
                );
              })}
              {editMode && (
                <button 
                  onClick={() => addSection(colNum)}
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors mt-4"
                >
                  <Plus size={20} /> Add Section
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
