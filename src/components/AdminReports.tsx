import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Filter, 
  Loader2, 
  Download, 
  CheckCircle, 
  Clock, 
  Eye, 
  FileBarChart2, 
  Users, 
  Target, 
  Activity, 
  FileText,
  Camera,
  ShieldAlert,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { db, EvaluationDocument } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Questionnaire } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AdminReportsProps {
  questionnaire: Questionnaire;
  onViewReport: (evalDoc: EvaluationDocument) => void;
  onViewDetail: (evalDoc: EvaluationDocument) => void;
}

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminReports({ questionnaire, onViewReport, onViewDetail }: AdminReportsProps) {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<EvaluationDocument[]>([]);
  
  // Filters
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [questionnaire.id, questionnaire.collectionPath]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qRef = query(collection(db, questionnaire.collectionPath), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(qRef);
      const evals: EvaluationDocument[] = [];
      snapshot.forEach(d => {
        evals.push(d.data() as EvaluationDocument);
      });
      setEvaluations(evals);
    } catch (err) {
      console.error(`Error fetching reports for ${questionnaire.collectionPath}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const isPerfil = questionnaire.id === 'perfil_profesional';

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(item => {
      if (selectedUser !== 'all' && item.profile.email !== selectedUser) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      return true;
    });
  }, [evaluations, selectedUser, selectedStatus]);

  const uniqueUsers = Array.from(new Set(evaluations.map(item => item.profile.email)));

  // Analytics for Soporte TI
  const scAnalytics = useMemo(() => {
    if (isPerfil) return null;
    const completed = filteredEvaluations.filter(e => e.status === 'completed');
    if (completed.length === 0) return null;

    let totalScore = 0;
    let totalTechEnergy = 0;
    let totalHumanEnergy = 0;
    const pillarScores: Record<string, { sum: number; count: number }> = {};
    const userScores: Record<string, { sum: number; count: number; name: string }> = {};

    completed.forEach(item => {
      const answers = item.answers as any;
      if (!answers?.section2?.pillars) return;

      const pillars = answers.section2.pillars;
      let evalScoreSum = 0;
      let evalPillarsCount = 0;

      Object.keys(pillars).forEach(pillarKey => {
        const p = pillars[pillarKey];
        if (p && typeof p.rating === 'number') {
          evalScoreSum += p.rating;
          evalPillarsCount += 1;

          if (!pillarScores[pillarKey]) {
            pillarScores[pillarKey] = { sum: 0, count: 0 };
          }
          pillarScores[pillarKey].sum += p.rating;
          pillarScores[pillarKey].count += 1;
        }
      });

      if (evalPillarsCount > 0) {
        const avg = evalScoreSum / evalPillarsCount;
        totalScore += avg;

        const email = item.profile.email;
        if (!userScores[email]) {
          userScores[email] = { sum: 0, count: 0, name: item.profile.name };
        }
        userScores[email].sum += avg;
        userScores[email].count += 1;
      }

      if (answers.section1 && typeof answers.section1.energyTech === 'number') {
        totalTechEnergy += answers.section1.energyTech;
        totalHumanEnergy += (100 - answers.section1.energyTech);
      }
    });

    const pillarAverages = Object.keys(pillarScores).map(key => {
      const p = pillarScores[key];
      const namesMap: Record<string, string> = {
        'comunicacion': 'Comunicación',
        'empatia': 'Empatía',
        'ownership': 'Ownership',
        'calidad': 'Calidad Técnica',
        'tiempo': 'Gestión del Tiempo',
        'actitud': 'Actitud',
        'mejora': 'Mejora Continua',
        'trabajo_equipo': 'Trabajo en Equipo'
      };
      return {
        key,
        name: namesMap[key] || key,
        promedio: Number((p.sum / p.count).toFixed(1))
      };
    });

    const topUsersData = Object.keys(userScores).map(email => {
      const u = userScores[email];
      return {
        email,
        name: u.name,
        puntaje: Number((u.sum / u.count).toFixed(1))
      };
    }).sort((a, b) => b.puntaje - a.puntaje).slice(0, 5);

    const count = completed.length || 1;
    const energyData = [
      { name: 'Técnica', value: Math.round(totalTechEnergy / count) },
      { name: 'Humana', value: Math.round(totalHumanEnergy / count) }
    ];

    return {
      averageGeneral: (totalScore / count).toFixed(1),
      avgTechEnergy: Math.round(totalTechEnergy / count),
      avgHumanEnergy: Math.round(totalHumanEnergy / count),
      pillarAverages,
      topUsersData,
      energyData
    };
  }, [filteredEvaluations, isPerfil]);

  // Analytics for Perfil Profesional
  const perfilAnalytics = useMemo(() => {
    if (!isPerfil) return null;
    const completedCount = filteredEvaluations.filter(e => e.status === 'completed').length;
    const inProgressCount = filteredEvaluations.filter(e => e.status === 'in_progress').length;

    let hasPhotoCount = 0;
    let needsShootCount = 0;
    let privacyRestrictedCount = 0;
    const skillsMap: Record<string, number> = {};

    filteredEvaluations.forEach(item => {
      const a = item.answers as any;
      if (a?.fotoPreferencia === 'tengo_foto') hasPhotoCount += 1;
      if (a?.fotoPreferencia === 'coordinar_sesion') needsShootCount += 1;
      if (a?.restriccionesPrivacidad && a.restriccionesPrivacidad.trim().length > 3) {
        privacyRestrictedCount += 1;
      }

      if (Array.isArray(a?.habilidadesEspecialidades)) {
        a.habilidadesEspecialidades.forEach((skill: string) => {
          skillsMap[skill] = (skillsMap[skill] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillsMap)
      .map(([name, cantidad]) => ({ name, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 7);

    return {
      completedCount,
      inProgressCount,
      hasPhotoCount,
      needsShootCount,
      privacyRestrictedCount,
      topSkills
    };
  }, [filteredEvaluations, isPerfil]);

  const handleExportCSV = () => {
    if (filteredEvaluations.length === 0) return;
    
    let headers: string[];
    let rows: any[][];

    if (isPerfil) {
      headers = [
        'ID',
        'Colaborador',
        'Email',
        'Cargo',
        'Fecha Ingreso',
        'Años Experiencia',
        'Funciones (Que Haces)',
        'Especialidades',
        'Detalles Habilidades',
        'Estudios y Certificaciones',
        'Logro Profesional',
        'Que Disfruta del Trabajo',
        'Que le Gusta de FHONS',
        'Tres Palabras',
        'Hobbies',
        'Talento Oculto',
        'Anecdota Divertida',
        'Tema para Hablar Horas',
        'Frase o Lema',
        'Preferencia Foto',
        'LinkedIn',
        'Algo Mas',
        'Restricciones Privacidad',
        'Estado',
        'Fecha Actualización'
      ];
      rows = filteredEvaluations.map(item => {
        const a = item.answers as any;
        const skills = Array.isArray(a?.habilidadesEspecialidades) ? a.habilidadesEspecialidades.join('; ') : '';
        const words = Array.isArray(a?.tresPalabras) ? a.tresPalabras.filter(Boolean).join(' • ') : '';
        return [
          item.id,
          item.profile.name,
          item.profile.email,
          a?.cargo || '',
          a?.fechaIngreso || a?.tiempoFhons || '',
          a?.aniosExperiencia || '',
          a?.queHaces || '',
          skills,
          a?.habilidadesTexto || '',
          a?.estudiosCertificaciones || '',
          a?.logroProfesional || '',
          a?.disfruteTrabajo || '',
          a?.gustoFhons || '',
          words,
          a?.hobbies || '',
          a?.talentoOculto || '',
          a?.anecdotaDivertida || '',
          a?.temaHoras || '',
          a?.fraseLema || '',
          a?.fotoPreferencia === 'tengo_foto' ? 'Tiene foto propia' : 'Requiere coordinar sesión',
          a?.linkedinUrl || '',
          a?.algoMas || '',
          a?.restriccionesPrivacidad || 'Sin restricciones',
          item.status,
          new Date(item.updatedAt).toLocaleString()
        ];
      });
    } else {
      headers = ['ID', 'Agente', 'Email', 'Estado', 'Fecha'];
      rows = filteredEvaluations.map(item => [
        item.id,
        item.profile.name,
        item.profile.email,
        item.status,
        new Date(item.updatedAt).toLocaleString()
      ]);
    }
    
    const csvContent = [headers.join(',')]
      .concat(rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')))
      .join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${questionnaire.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin text-slate-600" />
        <p className="text-sm font-medium">Cargando métricas de {questionnaire.title}...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {questionnaire.collectionPath}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <BarChart3 size={20} className="text-slate-800" />
              {isPerfil ? 'Directorio & Métricas Web FHONS' : 'Métricas y Reportes de Soporte TI'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isPerfil 
              ? 'Consolidado de fichas de colaboradores para el sitio web corporativo de FHONS' 
              : 'Análisis cuantitativo de competencias de soporte técnico y servicio al cliente'}
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={filteredEvaluations.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 shadow-sm cursor-pointer"
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {isPerfil ? 'Colaborador' : 'Agente / Usuario'}
          </label>
          <select 
            value={selectedUser} 
            onChange={e => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
          >
            <option value="all">Todos ({uniqueUsers.length})</option>
            {uniqueUsers.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado</label>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
          >
            <option value="all">Todos los Estados ({evaluations.length})</option>
            <option value="completed">{isPerfil ? 'Fichas Completadas' : 'Evaluaciones Completadas'}</option>
            <option value="in_progress">{isPerfil ? 'Borradores en Progreso' : 'En Progreso'}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {isPerfil && perfilAnalytics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><Briefcase size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Fichas</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{filteredEvaluations.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">{perfilAnalytics.completedCount} completadas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completitud</h3>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">
              {filteredEvaluations.length > 0 
                ? Math.round((perfilAnalytics.completedCount / filteredEvaluations.length) * 100) 
                : 0}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{perfilAnalytics.inProgressCount} borradores</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Camera size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fotos Web</h3>
            </div>
            <p className="text-3xl font-extrabold text-blue-600">{perfilAnalytics.hasPhotoCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">{perfilAnalytics.needsShootCount} piden sesión fotográfica</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><ShieldAlert size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Privacidad</h3>
            </div>
            <p className="text-3xl font-extrabold text-amber-600">{perfilAnalytics.privacyRestrictedCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">con especificaciones</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><FileText size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluaciones</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{filteredEvaluations.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-700"><Users size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agentes Únicos</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{uniqueUsers.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Target size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promedio Global</h3>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 flex items-baseline gap-1">
              {scAnalytics?.averageGeneral || '-'} <span className="text-xs text-emerald-500 font-medium">/ 10</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Activity size={18} /></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completitud</h3>
            </div>
            <p className="text-3xl font-extrabold text-amber-600">
              {filteredEvaluations.length > 0 
                ? Math.round((filteredEvaluations.filter(e => e.status === 'completed').length / filteredEvaluations.length) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      {isPerfil && perfilAnalytics && perfilAnalytics.topSkills.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-slate-700" />
            Habilidades y Especialidades más Frecuentes en el Equipo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfilAnalytics.topSkills} margin={{ top: 5, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="cantidad" fill="#0f172a" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!isPerfil && scAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-slate-700" />
              Promedio por Pilar de Soporte TI
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scAnalytics.pillarAverages} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" height={45} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="promedio" fill="#0f172a" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 text-center">
                Energía Técnica vs Humana
              </h3>
              <div className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scAnalytics.energyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {scAnalytics.energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">
                Top Agentes
              </h3>
              <div className="space-y-3">
                {scAnalytics.topUsersData.length > 0 ? (
                  scAnalytics.topUsersData.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800 truncate max-w-[110px]">{user.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{user.puntaje} / 10</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No hay datos finalizados</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Breakdown */}
      {filteredEvaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
          <Filter size={40} className="opacity-20" />
          <p className="text-xs font-medium">No se encontraron registros con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              {isPerfil ? 'Fichas de Colaboradores' : 'Desglose de Evaluaciones'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-slate-700 shadow-sm">
              {filteredEvaluations.length} {filteredEvaluations.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">{isPerfil ? 'Colaborador / Cargo' : 'Agente / Correo'}</th>
                  {isPerfil ? (
                    <>
                      <th className="px-6 py-3.5">Foto Web</th>
                      <th className="px-6 py-3.5">Privacidad</th>
                    </>
                  ) : null}
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5">Última Actualización</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvaluations.map((item) => {
                  const a = item.answers as any;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.profile.name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {isPerfil && a?.cargo ? `${a.cargo} • ${item.profile.email}` : item.profile.email}
                        </div>
                      </td>
                      {isPerfil ? (
                        <>
                          <td className="px-6 py-4">
                            {a?.fotoPreferencia === 'tengo_foto' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200/60">
                                <CheckCircle size={12} /> Foto lista
                              </span>
                            ) : a?.fotoPreferencia === 'coordinar_sesion' ? (
                              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-blue-200/60">
                                <Camera size={12} /> Sesión pendiente
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Sin definir</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {a?.restriccionesPrivacidad && a.restriccionesPrivacidad.trim().length > 3 ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-200/60" title={a.restriccionesPrivacidad}>
                                <ShieldAlert size={12} /> Restricción
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Pública</span>
                            )}
                          </td>
                        </>
                      ) : null}
                      <td className="px-6 py-4">
                        {item.status === 'completed' ? (
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
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => onViewReport(item)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                          title={isPerfil ? "Ver Ficha Web Oficial" : "Ver Reporte Final"}
                        >
                          <FileBarChart2 size={13} /> {isPerfil ? 'Ficha Web' : 'Reporte'}
                        </button>
                        <button
                          onClick={() => onViewDetail(item)}
                          className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                          title="Ver Respuestas Sección por Sección"
                        >
                          <Eye size={13} /> Respuestas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
