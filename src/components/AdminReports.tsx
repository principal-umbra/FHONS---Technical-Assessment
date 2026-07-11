import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Filter, Loader2, Download, CheckCircle, Clock, Eye, FileBarChart2, Users, Target, Activity, FileText } from 'lucide-react';
import { db, EvaluationDocument, getQuestionnaires } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Questionnaire } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminReportsProps {
  onViewReport: (evalDoc: EvaluationDocument) => void;
  onViewDetail: (evalDoc: EvaluationDocument) => void;
}

export default function AdminReports({ onViewReport, onViewDetail }: AdminReportsProps) {
  const [loading, setLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<{evalDoc: EvaluationDocument, questionnaire: Questionnaire}[]>([]);
  
  // Filters
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('completed'); // Default to completed for accurate metrics

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const qList = await getQuestionnaires();
      setQuestionnaires(qList);
      
      const evals: {evalDoc: EvaluationDocument, questionnaire: Questionnaire}[] = [];
      
      for (const q of qList) {
        if (!q.collectionPath) continue;
        const snapshot = await getDocs(query(collection(db, q.collectionPath), orderBy('updatedAt', 'desc')));
        snapshot.forEach(d => {
          evals.push({
            evalDoc: d.data() as EvaluationDocument,
            questionnaire: q
          });
        });
      }
      
      setAllEvaluations(evals);
    } catch (err) {
      console.error('Error fetching data for reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter(item => {
      if (selectedQuestionnaire !== 'all' && item.questionnaire.id !== selectedQuestionnaire) return false;
      if (selectedUser !== 'all' && item.evalDoc.profile.email !== selectedUser) return false;
      if (selectedStatus !== 'all' && item.evalDoc.status !== selectedStatus) return false;
      return true;
    });
  }, [allEvaluations, selectedQuestionnaire, selectedUser, selectedStatus]);

  const uniqueUsers = Array.from(new Set(allEvaluations.map(item => item.evalDoc.profile.email)));

  // Analytics Metrics
  const analytics = useMemo(() => {
    const completed = filteredEvaluations.filter(e => e.evalDoc.status === 'completed');
    if (completed.length === 0) return null;

    // We specifically analyze 'servicio_al_cliente' data since it's the known structure
    const scEvaluations = completed.filter(e => e.questionnaire.id === 'servicio_al_cliente' || e.questionnaire.collectionPath === 'evaluations_servicio_al_cliente');

    let totalScore = 0;
    let totalTechEnergy = 0;
    let totalHumanEnergy = 0;
    const pillarScores: Record<string, { sum: number; count: number }> = {};
    const userScores: Record<string, { sum: number; count: number; name: string }> = {};

    scEvaluations.forEach(item => {
      const answers = item.evalDoc.answers as any;
      if (!answers?.section2?.pillars) return;
      
      // Calculate individual eval score
      const pillars = Object.values(answers.section2.pillars) as { rating: number }[];
      if (pillars.length === 0) return;
      
      const evalScore = pillars.reduce((sum, p) => sum + p.rating, 0) / pillars.length;
      totalScore += evalScore;

      // Energy
      if (answers.section1?.energyTech !== undefined) {
        totalTechEnergy += Number(answers.section1.energyTech);
        totalHumanEnergy += (100 - Number(answers.section1.energyTech));
      }

      // Pillars aggregation
      Object.entries(answers.section2.pillars).forEach(([key, value]: [string, any]) => {
        if (!pillarScores[key]) pillarScores[key] = { sum: 0, count: 0 };
        pillarScores[key].sum += value.rating || 0;
        pillarScores[key].count += 1;
      });

      // User aggregation
      const email = item.evalDoc.profile.email;
      if (!userScores[email]) userScores[email] = { sum: 0, count: 0, name: item.evalDoc.profile.name };
      userScores[email].sum += evalScore;
      userScores[email].count += 1;
    });

    const scCount = scEvaluations.length || 1; // Prevent division by zero
    
    // Formatting data for Recharts
    const pillarChartData = Object.keys(pillarScores).map(key => ({
      name: key.replace(/_/g, ' ').substring(0, 15) + '...',
      promedio: Number((pillarScores[key].sum / pillarScores[key].count).toFixed(1))
    }));

    const topUsersData = Object.values(userScores)
      .map(u => ({ name: u.name.split(' ')[0], puntaje: Number((u.sum / u.count).toFixed(1)) }))
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 5); // Top 5

    const energyData = [
      { name: 'Técnica', value: Math.round(totalTechEnergy / scCount) },
      { name: 'Humana', value: Math.round(totalHumanEnergy / scCount) }
    ];

    return {
      averageScore: (totalScore / scCount).toFixed(1),
      pillarChartData,
      topUsersData,
      energyData,
      scCount
    };
  }, [filteredEvaluations]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleExportCSV = () => {
    if (filteredEvaluations.length === 0) return;
    
    const headers = ['ID', 'Cuestionario', 'Usuario Nombre', 'Usuario Email', 'Estado', 'Fecha'];
    const rows = filteredEvaluations.map(item => [
      item.evalDoc.id,
      item.questionnaire.title,
      item.evalDoc.profile.name,
      item.evalDoc.profile.email,
      item.evalDoc.status,
      new Date(item.evalDoc.updatedAt).toLocaleString()
    ]);
    
    const csvContent = [headers.join(',')]
      .concat(rows.map(row => row.map(cell => `"${cell}"`).join(',')))
      .join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_evaluaciones_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Generando reportes y métricas...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={24} className="text-indigo-600" />
            Métricas y Reportes de Evaluaciones
          </h2>
          <p className="text-sm text-slate-500 mt-1">Análisis cuantitativo de cuestionarios y agentes</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={filteredEvaluations.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
        >
          <Download size={16} />
          Exportar CSV de Datos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cuestionario</label>
          <select 
            value={selectedQuestionnaire} 
            onChange={e => setSelectedQuestionnaire(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="all">Todos los Cuestionarios</option>
            {questionnaires.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Agente / Usuario</label>
          <select 
            value={selectedUser} 
            onChange={e => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="all">Todos los Agentes</option>
            {uniqueUsers.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="all">Todos los Estados</option>
            <option value="completed">Completado</option>
            <option value="in_progress">En Progreso</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><FileText size={20} /></div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Evaluaciones Filtradas</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800">{filteredEvaluations.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Users size={20} /></div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Agentes Únicos</h3>
          </div>
          <p className="text-4xl font-bold text-indigo-600">
            {new Set(filteredEvaluations.map(e => e.evalDoc.profile.email)).size}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Target size={20} /></div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Promedio Global</h3>
          </div>
          <p className="text-4xl font-bold text-emerald-600 flex items-baseline gap-1">
            {analytics?.averageScore || '-'} <span className="text-lg text-emerald-400 font-medium">/ 10</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Activity size={20} /></div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completitud</h3>
          </div>
          <p className="text-4xl font-bold text-amber-600">
            {allEvaluations.length > 0 
              ? Math.round((filteredEvaluations.filter(e => e.evalDoc.status === 'completed').length / filteredEvaluations.length) * 100) || 0
              : 0}%
          </p>
        </div>
      </div>

      {analytics && analytics.scCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" />
              Promedio por Pilar de Evaluación
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.pillarChartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="promedio" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6 text-center text-sm">Distribución de Energía (Promedio)</h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.energyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-sm">Top Agentes (Puntaje Promedio)</h3>
              <div className="space-y-4 mt-2">
                {analytics.topUsersData.length > 0 ? (
                  analytics.topUsersData.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[100px]">{user.name}</span>
                      </div>
                      <div className="text-sm font-bold text-indigo-600">{user.puntaje}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No hay datos suficientes</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredEvaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
          <Filter size={48} className="opacity-20" />
          <p className="text-sm">Ajusta los filtros para ver los registros.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="font-semibold text-slate-700 text-sm">Desglose de Registros</span>
            <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
              {filteredEvaluations.length} {filteredEvaluations.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Cuestionario</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvaluations.map((item) => (
                  <tr key={`${item.questionnaire.id}-${item.evalDoc.id}`} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">{item.questionnaire.title}</span>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {item.evalDoc.id.substring(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.evalDoc.profile.name}</div>
                      <div className="text-xs text-slate-500">{item.evalDoc.profile.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.evalDoc.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          <CheckCircle size={12} /> Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          <Clock size={12} /> En Progreso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {new Date(item.evalDoc.updatedAt).toLocaleDateString()} {new Date(item.evalDoc.updatedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {item.evalDoc.status === 'completed' && (
                        <button
                          onClick={() => onViewReport(item.evalDoc)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                          title="Ver Reporte Final"
                        >
                          <FileBarChart2 size={14} /> Reporte
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetail(item.evalDoc)}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                        title="Ver Respuestas Sección por Sección"
                      >
                        <Eye size={14} /> Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}