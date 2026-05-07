import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, MapPin, Activity, AlertCircle, 
  ChevronRight, RefreshCw, BarChart3, PieChart, Layers,
  ArrowUpRight, Download, BrainCircuit
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#8b5cf6', '#d946ef', '#3b82f6', '#10b981'];

const App = () => {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch('http://localhost:8001/states');
      const result = await response.json();
      setStates(result.states);
      if (result.states.length > 0) setSelectedState(result.states[0]);
    } catch (err) {
      setError('Connection failed. Ensure the forecasting service is running on port 8001.');
    }
  };

  const fetchForecast = async (state) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8001/forecast/${state}`);
      if (!response.ok) throw new Error('Forecast generation failed.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedState) fetchForecast(selectedState);
  }, [selectedState]);

  const chartData = data ? [
    ...data.historical.map(h => ({ name: h.Date, actual: h.Total, forecast: null })),
    ...data.forecast.map(f => ({ name: f.Date, actual: null, forecast: f.Total }))
  ] : [];

  const metricsData = data ? Object.entries(data.all_metrics).map(([name, value]) => ({
    name,
    mape: (value * 100).toFixed(2)
  })).sort((a, b) => a.mape - b.mape) : [];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="text-primary-600 font-black tracking-[0.3em] text-[10px] uppercase">Case Study Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient">
            Predictive Analytics
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="pl-4 pr-2">
            <MapPin size={18} className="text-primary-500" />
          </div>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent border-none text-slate-900 font-black uppercase tracking-widest text-[10px] outline-none min-w-[200px] cursor-pointer py-4 pr-10 appearance-none"
          >
            {states.map(s => <option key={s} value={s} className="bg-white">{s}</option>)}
          </select>
        </div>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card !bg-red-50 border-red-100 p-8 mb-12 flex items-center gap-6 text-red-600"
        >
          <AlertCircle size={32} />
          <div>
            <p className="font-black uppercase tracking-widest text-xs">System Error Detected</p>
            <p className="text-lg font-medium opacity-80 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-[50vh] space-y-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Processing Intelligence</p>
              <p className="text-sm font-medium text-slate-500">Cross-validating ARIMA, Prophet, XGBoost & LSTM models...</p>
            </div>
          </motion.div>
        ) : data && (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Left Column: Chart & Summary */}
            <div className="xl:col-span-8 space-y-8">
              <div className="glass-card p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                      <TrendingUp className="text-primary-600" />
                      8-Week Projection
                    </h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sales Volume Strategy Hub</p>
                  </div>
                  <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/20" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Historical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/20" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Predicted</span>
                    </div>
                  </div>
                </div>

                <div className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colHist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d946ef" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10}
                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                      />
                      <YAxis 
                        stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10}
                        tickFormatter={(val) => `$${(val/1e6).toFixed(1)}M`} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colHist)" 
                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} connectNulls
                      />
                      <Area 
                        type="monotone" dataKey="forecast" stroke="#d946ef" strokeWidth={4} strokeDasharray="8 4" fillOpacity={1} fill="url(#colPred)" 
                        dot={{ r: 4, fill: '#d946ef', strokeWidth: 2, stroke: '#fff' }} connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-10 !bg-primary-600 !border-none relative overflow-hidden group">
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Activity className="text-white" size={28} />
                      </div>
                      <span className="bg-white/20 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
                        Top Precision
                      </span>
                    </div>
                    <div>
                      <p className="text-primary-100/60 font-black text-[10px] uppercase tracking-widest mb-1">Champion Algorithm</p>
                      <h4 className="text-4xl font-black text-white tracking-tighter">{data.best_model}</h4>
                      <p className="text-primary-100/80 text-sm font-medium mt-4 leading-relaxed max-w-[80%]">
                        Optimized with lag-based feature engineering and validated against {(data.mape * 100).toFixed(2)}% MAPE threshold.
                      </p>
                    </div>
                  </div>
                  <Layers className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>

                <div className="glass-card p-10 flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <PieChart className="text-primary-500" size={20} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Model Accuracy Comparison</span>
                      </div>
                      <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metricsData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} width={80} />
                            <Bar dataKey="mape" radius={[0, 4, 4, 0]} barSize={14}>
                              {metricsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === data.best_model ? '#8b5cf6' : '#f1f5f9'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lowest Error Rate</span>
                      <span className="text-lg font-black text-slate-900">{(data.mape * 100).toFixed(2)}%</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Weekly Schedule & Export */}
            <div className="xl:col-span-4 space-y-8">
              <div className="glass-card flex flex-col h-full">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                    <Calendar className="text-primary-600" size={18} />
                    Weekly Schedule
                  </h3>
                  <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[500px] p-2">
                  {data.forecast.map((item, i) => (
                    <motion.div 
                      key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-6 rounded-2xl hover:bg-slate-50 transition-all group cursor-default"
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-[10px] font-black text-slate-300 group-hover:text-primary-500 transition-colors">W{i+1}</div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 mb-0.5">{new Date(item.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Prediction</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">${(item.Total / 1e6).toFixed(2)}M</div>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600">
                          <ArrowUpRight size={10} /> +2.4%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-8 mt-auto">
                   <button className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/10 group active:scale-95">
                     <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                     Export Analysis Report
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-6 bg-white shadow-2xl border-slate-100 ring-1 ring-slate-900/5 animate-byte-slide">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
          {new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="space-y-3">
          {payload.map((p, i) => p.value && (
            <div key={i} className="flex items-center justify-between gap-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.name === 'actual' ? 'Historical' : 'Predicted'}</span>
              </div>
              <span className="text-sm font-black text-slate-900">
                ${(p.value / 1e6).toFixed(2)}M
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default App;
