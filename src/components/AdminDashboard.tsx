import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  ArrowLeft, 
  Users, 
  BarChart3, 
  FlaskConical, 
  Settings, 
  Library, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Database,
  ArrowRight,
  Sparkles,
  ChevronRight,
  UserCheck,
  Plus,
  Search,
  Grid,
  List,
  ExternalLink,
  Headphones,
  Globe,
  Tag,
  Shield,
  HelpCircle
} from 'lucide-react';
import { 
  EvaluationDocument, 
  getQuestionnaires, 
  seedQuestionnairesIfMissing, 
  saveQuestionnaire,
  db 
} from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Questionnaire } from '../types';
import AdminUsersList from './AdminUsersList';
import AdminUserDetail from './AdminUserDetail';
import AdminEvaluationSections from './AdminEvaluationSections';
import AdminReports from './AdminReports';
import AdminLaboratory from './AdminLaboratory';
import AdminLibrero from './AdminLibrero';
import AdminSettings from './AdminSettings';
import AdminAssignments from './AdminAssignments';
import SummaryScreen from './questionnaires/servicio_al_cliente/SummaryScreen';
import SummaryScreenPerfil from './questionnaires/perfil_profesional/SummaryScreenPerfil';
import DocumentReportSummary from './questionnaires/DocumentReportSummary';

interface AdminDashboardProps {
  onBack: () => void;
}

interface FormStats {
  total: number;
  completed: number;
  inProgress: number;
  uniqueUsers: number;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [formStats, setFormStats] = useState<Record<string, FormStats>>({});
  const [loadingForms, setLoadingForms] = useState(true);

  // Global Hub Navigation: 'cuestionarios' (Forms catalog) vs 'asignaciones' (Agent assignments)
  const [hubTab, setHubTab] = useState<'cuestionarios' | 'asignaciones'>('cuestionarios');
  const [preselectedAssignQId, setPreselectedAssignQId] = useState<string | undefined>(undefined);

  // Questionnaire Detail view tabs
  const [activeTab, setActiveTab] = useState<'usuarios' | 'reportes' | 'asignaciones' | 'laboratorio' | 'librero' | 'configuraciones'>('usuarios');
  const [currentView, setCurrentView] = useState<'form_selection' | 'tabs' | 'user_detail' | 'eval_report' | 'eval_detail'>('form_selection');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<EvaluationDocument | null>(null);

  // Questionnaire Catalog UI states
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [showNewQModal, setShowNewQModal] = useState(false);

  // New Questionnaire Form
  const [newQTitle, setNewQTitle] = useState('');
  const [newQId, setNewQId] = useState('');
  const [newQDesc, setNewQDesc] = useState('');
  const [newQColl, setNewQColl] = useState('');
  const [newQCat, setNewQCat] = useState('');
  const [creatingQ, setCreatingQ] = useState(false);
  const [qCreateError, setQCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadFormsAndStats();
  }, []);

  const loadFormsAndStats = async () => {
    setLoadingForms(true);
    try {
      await seedQuestionnairesIfMissing();
      const forms = await getQuestionnaires();
      setQuestionnaires(forms);

      // Fetch quick stats for each form in parallel
      const statsMap: Record<string, FormStats> = {};
      for (const form of forms) {
        if (!form.collectionPath) continue;
        try {
          const snapshot = await getDocs(collection(db, form.collectionPath));
          let total = 0;
          let completed = 0;
          let inProgress = 0;
          const emails = new Set<string>();

          snapshot.forEach(docSnap => {
            const data = docSnap.data() as EvaluationDocument;
            total += 1;
            if (data.status === 'completed') completed += 1;
            if (data.status === 'in_progress') inProgress += 1;
            if (data.profile?.email) emails.add(data.profile.email.toLowerCase().trim());
          });

          statsMap[form.id] = {
            total,
            completed,
            inProgress,
            uniqueUsers: emails.size
          };
        } catch (e) {
          console.error(`Error loading stats for ${form.collectionPath}:`, e);
          statsMap[form.id] = { total: 0, completed: 0, inProgress: 0, uniqueUsers: 0 };
        }
      }
      setFormStats(statsMap);
    } catch (err) {
      console.error("Error loading forms:", err);
    } finally {
      setLoadingForms(false);
    }
  };

  const handleSelectForm = (form: Questionnaire) => {
    setSelectedQuestionnaire(form);
    setCurrentView('tabs');
    setActiveTab('usuarios');
    setSelectedUserEmail(null);
    setSelectedEval(null);
  };

  const handleGoToAssignmentsForForm = (formId: string) => {
    setPreselectedAssignQId(formId);
    setHubTab('asignaciones');
    setCurrentView('form_selection');
  };

  const handleBackToFormSelection = () => {
    setCurrentView('form_selection');
    setSelectedUserEmail(null);
    setSelectedEval(null);
    loadFormsAndStats(); // refresh stats
  };

  const handleUserSelect = (email: string) => {
    setSelectedUserEmail(email);
    setCurrentView('user_detail');
  };

  const handleViewReport = (evalDoc: EvaluationDocument) => {
    setSelectedEval(evalDoc);
    setCurrentView('eval_report');
  };

  const handleViewDetail = (evalDoc: EvaluationDocument) => {
    setSelectedEval(evalDoc);
    setCurrentView('eval_detail');
  };

  const handleBack = () => {
    if (currentView === 'form_selection') {
      onBack();
    } else if (currentView === 'tabs') {
      handleBackToFormSelection();
    } else if (currentView === 'user_detail') {
      setCurrentView('tabs');
      setSelectedUserEmail(null);
    } else if (currentView === 'eval_report' || currentView === 'eval_detail') {
      if (selectedUserEmail) {
        setCurrentView('user_detail');
      } else {
        setCurrentView('tabs');
      }
      setSelectedEval(null);
    }
  };

  const handleCreateNewQuestionnaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) {
      setQCreateError('El título del cuestionario es obligatorio.');
      return;
    }
    const safeId = (newQId.trim() || newQTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')).replace(/_+/g, '_');
    const safeColl = newQColl.trim() || `evaluations_${safeId}`;

    setCreatingQ(true);
    setQCreateError(null);
    try {
      const newForm: Questionnaire = {
        id: safeId,
        title: newQTitle.trim(),
        description: newQDesc.trim() || 'Cuestionario de evaluación y diagnóstico operativo.',
        collectionPath: safeColl,
        uiPath: safeId,
        category: newQCat.trim() || 'General',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await saveQuestionnaire(newForm);
      setShowNewQModal(false);
      setNewQTitle('');
      setNewQId('');
      setNewQDesc('');
      setNewQColl('');
      setNewQCat('');
      await loadFormsAndStats();
    } catch (err) {
      console.error('Error creating questionnaire:', err);
      setQCreateError('Error al guardar el cuestionario en Firestore.');
    } finally {
      setCreatingQ(false);
    }
  };

  // Aggregated global stats
  const totalGlobalEvaluations = Object.values(formStats).reduce((acc, s) => acc + s.total, 0);
  const totalGlobalCompleted = Object.values(formStats).reduce((acc, s) => acc + s.completed, 0);
  const totalGlobalUsers = Object.values(formStats).reduce((acc, s) => acc + s.uniqueUsers, 0);
  const globalCompletionRate = totalGlobalEvaluations > 0 
    ? Math.round((totalGlobalCompleted / totalGlobalEvaluations) * 100) 
    : 0;

  // Filtered questionnaires
  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.collectionPath.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(questionnaires.map(q => q.category).filter(Boolean)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto w-full py-6 md:py-10 px-4"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2.5 text-slate-500 hover:text-slate-900 transition rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer"
            title={currentView === 'form_selection' ? "Salir del Admin" : "Volver"}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                FHONS Platform Hub
              </span>
              {selectedQuestionnaire && currentView !== 'form_selection' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {selectedQuestionnaire.collectionPath}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {currentView === 'form_selection' && (hubTab === 'cuestionarios' ? 'Centro de Gestión de Cuestionarios' : 'Asignación de Cuestionarios a Agentes')}
              {currentView === 'tabs' && selectedQuestionnaire?.title}
              {currentView === 'user_detail' && `Registros de ${selectedUserEmail}`}
              {currentView === 'eval_report' && (selectedQuestionnaire?.id === 'perfil_profesional' ? 'Ficha Web Oficial' : 'Reporte de Evaluación')}
              {currentView === 'eval_detail' && 'Detalle Respuestas Sección por Sección'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentView !== 'form_selection' && selectedQuestionnaire && (
            <button
              onClick={handleBackToFormSelection}
              className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Layers size={15} className="text-slate-500" />
              Cambiar de Cuestionario
            </button>
          )}
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <LogOut size={15} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* VIEW 1: Form Selection & Scalable Management Hub */}
      {currentView === 'form_selection' && (
        <div className="space-y-6">

          {/* Hub Navigation Tabs: Cuestionarios vs Asignaciones a Agentes */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHubTab('cuestionarios')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  hubTab === 'cuestionarios'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers size={15} />
                <span>Cuestionarios Disponibles</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  hubTab === 'cuestionarios' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {questionnaires.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHubTab('asignaciones');
                  setPreselectedAssignQId(undefined);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  hubTab === 'asignaciones'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck size={15} />
                <span>Asignación a Agentes</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  hubTab === 'asignaciones' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  Por Correo
                </span>
              </button>
            </div>

            {hubTab === 'cuestionarios' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewQModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Nuevo Cuestionario</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB CONTENT A: Cuestionarios Catalog */}
          {hubTab === 'cuestionarios' && (
            <div className="space-y-6">
              {/* Global Scalability Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Cuestionarios Activos</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">{questionnaires.length}</div>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={11} /> Listos para escalar
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Layers size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Formularios</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">{totalGlobalEvaluations}</div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Registrados en Firestore</span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <FileText size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Colaboradores Únicos</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">{totalGlobalUsers}</div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Agentes evaluados</span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Users size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Tasa de Finalización</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">{globalCompletionRate}%</div>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">{totalGlobalCompleted} completadas</span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <BarChart3 size={22} />
                  </div>
                </div>
              </div>

              {/* Search, Filter & Layout Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar cuestionarios por nombre, descripción o colección de Firestore..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {categories.length > 0 && (
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="all">Todas las Categorías</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}

                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setViewLayout('grid')}
                      className={`p-1.5 rounded-lg text-xs cursor-pointer transition ${viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                      title="Vista Cuadrícula"
                    >
                      <Grid size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewLayout('table')}
                      className={`p-1.5 rounded-lg text-xs cursor-pointer transition ${viewLayout === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                      title="Vista Lista"
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Layout */}
              {viewLayout === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuestionnaires.map((q) => {
                    const stats = formStats[q.id] || { total: 0, completed: 0, inProgress: 0, uniqueUsers: 0 };
                    const isPerfil = q.id === 'perfil_profesional';
                    const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

                    return (
                      <div 
                        key={q.id}
                        className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all p-6 shadow-sm hover:shadow-md flex flex-col justify-between group"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-2xl ${
                                isPerfil ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}>
                                {isPerfil ? <Globe size={24} /> : <Headphones size={24} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                                    {q.category || 'Evaluación'}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-mono">
                                    <CheckCircle2 size={10} /> Activo
                                  </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 font-display">
                                  {q.title}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed mb-5 min-h-[36px]">
                            {q.description}
                          </p>

                          {/* Collection badge */}
                          <div className="flex items-center gap-2 mb-5">
                            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                              <Database size={11} className="text-slate-400" />
                              {q.collectionPath}
                            </span>
                            {q.estimatedMinutes && (
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <Clock size={11} /> ~{q.estimatedMinutes} min
                              </span>
                            )}
                          </div>

                          {/* Metrics Panel */}
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Envíos</span>
                                <span className="text-base font-extrabold text-slate-800">{stats.total}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Completados</span>
                                <span className="text-base font-extrabold text-emerald-600">{stats.completed}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Colaboradores</span>
                                <span className="text-base font-extrabold text-slate-800">{stats.uniqueUsers}</span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>Tasa de finalización</span>
                                <span className="font-bold text-slate-700">{completionPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${completionPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dual Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleGoToAssignmentsForForm(q.id)}
                            className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck size={14} />
                            <span>Asignar Agentes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectForm(q)}
                            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>Abrir Datos & Pestañas</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Layout */}
              {viewLayout === 'table' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Cuestionario</th>
                        <th className="py-3 px-4">Colección Firestore</th>
                        <th className="py-3 px-4 text-center">Total Envíos</th>
                        <th className="py-3 px-4 text-center">Completados</th>
                        <th className="py-3 px-4 text-center">Colaboradores</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredQuestionnaires.map((q) => {
                        const stats = formStats[q.id] || { total: 0, completed: 0, inProgress: 0, uniqueUsers: 0 };
                        const isPerfil = q.id === 'perfil_profesional';

                        return (
                          <tr key={q.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl shrink-0 ${isPerfil ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {isPerfil ? <Globe size={18} /> : <Headphones size={18} />}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{q.title}</div>
                                  <div className="text-[11px] text-slate-400 max-w-sm truncate">{q.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                              {q.collectionPath}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                              {stats.total}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-emerald-600">
                              {stats.completed}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                              {stats.uniqueUsers}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleGoToAssignmentsForForm(q.id)}
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <UserCheck size={12} />
                                  <span>Asignar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectForm(q)}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <span>Abrir</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT B: Agent Assignments Module */}
          {hubTab === 'asignaciones' && (
            <AdminAssignments
              questionnaires={questionnaires}
              onSelectQuestionnaire={handleSelectForm}
              preselectedQuestionnaireId={preselectedAssignQId}
            />
          )}

        </div>
      )}

      {/* VIEW 2: Tabs for the strictly selected questionnaire */}
      {currentView === 'tabs' && selectedQuestionnaire && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden min-h-[600px] flex flex-col">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'usuarios' 
                  ? 'text-slate-900 border-b-2 border-slate-900 bg-white' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Users size={16} /> 
              {selectedQuestionnaire.id === 'perfil_profesional' ? 'Colaboradores' : 'Agentes / Usuarios'}
            </button>

            <button
              onClick={() => setActiveTab('asignaciones')}
              className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'asignaciones' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <UserCheck size={16} /> Asignaciones
            </button>

            <button
              onClick={() => setActiveTab('reportes')}
              className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'reportes' 
                  ? 'text-slate-900 border-b-2 border-slate-900 bg-white' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <BarChart3 size={16} /> Métricas & Reportes
            </button>

            <button
              onClick={() => setActiveTab('laboratorio')}
              className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'laboratorio' 
                  ? 'text-slate-900 border-b-2 border-slate-900 bg-white' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <FlaskConical size={16} /> 
              {selectedQuestionnaire.id === 'perfil_profesional' ? 'Laboratorio Redacción Web' : 'Laboratorio IA'}
            </button>

            <button
              onClick={() => setActiveTab('librero')}
              className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'librero' 
                  ? 'text-slate-900 border-b-2 border-slate-900 bg-white' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Library size={16} /> Librero
            </button>

            <button
              onClick={() => setActiveTab('configuraciones')}
              className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'configuraciones' 
                  ? 'text-slate-900 border-b-2 border-slate-900 bg-white' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Settings size={16} /> Configuraciones
            </button>
          </div>
          
          {/* Active Tab Content */}
          <div className="flex-1 bg-white">
            {activeTab === 'usuarios' && (
              <AdminUsersList 
                questionnaire={selectedQuestionnaire} 
                onUserSelect={handleUserSelect} 
              />
            )}
            {activeTab === 'asignaciones' && (
              <div className="p-6">
                <AdminAssignments 
                  questionnaires={questionnaires}
                  preselectedQuestionnaireId={selectedQuestionnaire.id}
                />
              </div>
            )}
            {activeTab === 'reportes' && (
              <AdminReports 
                questionnaire={selectedQuestionnaire} 
                onViewReport={handleViewReport} 
                onViewDetail={handleViewDetail} 
              />
            )}
            {activeTab === 'laboratorio' && (
              <AdminLaboratory 
                questionnaire={selectedQuestionnaire} 
              />
            )}
            {activeTab === 'librero' && (
              <AdminLibrero 
                questionnaire={selectedQuestionnaire} 
              />
            )}
            {activeTab === 'configuraciones' && (
              <AdminSettings />
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Detail for a selected user under this specific questionnaire */}
      {currentView === 'user_detail' && selectedUserEmail && selectedQuestionnaire && (
        <AdminUserDetail 
          questionnaire={selectedQuestionnaire}
          email={selectedUserEmail} 
          onViewReport={handleViewReport}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* VIEW 4: Evaluation Report */}
      {currentView === 'eval_report' && selectedEval && (
        <div className="w-full">
          {selectedEval.questionnaireId === 'perfil_profesional' || selectedEval.answers?.cargo !== undefined ? (
            <SummaryScreenPerfil
              profile={selectedEval.profile}
              answers={selectedEval.answers}
              onReset={() => {}}
              readOnly={true}
              editToken={selectedEval.editToken || (selectedEval.answers as any)?.editToken || selectedEval.profile?.editToken}
              evaluationId={selectedEval.id}
            />
          ) : selectedEval.questionnaireId === 'servicio_al_cliente' ? (
            <SummaryScreen
              profile={selectedEval.profile}
              answers={selectedEval.answers}
              onReset={() => {}}
              readOnly={true}
              editToken={selectedEval.editToken || (selectedEval.answers as any)?.editToken || selectedEval.profile?.editToken}
              evaluationId={selectedEval.id}
            />
          ) : (
            <DocumentReportSummary
              evalDoc={selectedEval}
              onBack={() => setCurrentView('tabs')}
              readOnly={true}
            />
          )}
        </div>
      )}

      {/* VIEW 5: Evaluation Section by Section Detail */}
      {currentView === 'eval_detail' && selectedEval && (
        <AdminEvaluationSections evalDoc={selectedEval} />
      )}

      {/* Modal: Registrar Nuevo Cuestionario (Scalability support) */}
      <AnimatePresence>
        {showNewQModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Registrar Nuevo Cuestionario</h3>
                    <p className="text-xs text-slate-500">Añade una nueva evaluación a la plataforma para escalar.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewQModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewQuestionnaire} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Título del Cuestionario *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Evaluación de Liderazgo Operativo"
                    value={newQTitle}
                    onChange={(e) => setNewQTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Identificador Único (ID)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. liderazgo_operativo (opcional, se autogenera)"
                    value={newQId}
                    onChange={(e) => setNewQId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Descripción del Cuestionario
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Objetivo y enfoque del cuestionario..."
                    value={newQDesc}
                    onChange={(e) => setNewQDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Colección Firestore
                    </label>
                    <input
                      type="text"
                      placeholder="evaluations_..."
                      value={newQColl}
                      onChange={(e) => setNewQColl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Categoría
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Operaciones / Calidad"
                      value={newQCat}
                      onChange={(e) => setNewQCat(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                    />
                  </div>
                </div>

                {qCreateError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    {qCreateError}
                  </p>
                )}

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewQModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingQ}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {creatingQ ? 'Guardando...' : 'Crear Cuestionario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
