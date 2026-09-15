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
  ChevronRight
} from 'lucide-react';
import { EvaluationDocument, getQuestionnaires, seedQuestionnairesIfMissing, db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Questionnaire } from '../types';
import AdminUsersList from './AdminUsersList';
import AdminUserDetail from './AdminUserDetail';
import AdminEvaluationSections from './AdminEvaluationSections';
import AdminReports from './AdminReports';
import AdminLaboratory from './AdminLaboratory';
import AdminLibrero from './AdminLibrero';
import AdminSettings from './AdminSettings';
import SummaryScreen from './questionnaires/servicio_al_cliente/SummaryScreen';
import SummaryScreenPerfil from './questionnaires/perfil_profesional/SummaryScreenPerfil';

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

  const [activeTab, setActiveTab] = useState<'usuarios' | 'reportes' | 'laboratorio' | 'librero' | 'configuraciones'>('usuarios');
  const [currentView, setCurrentView] = useState<'form_selection' | 'tabs' | 'user_detail' | 'eval_report' | 'eval_detail'>('form_selection');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<EvaluationDocument | null>(null);

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
            if (data.profile?.email) emails.add(data.profile.email);
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FHONS Admin Hub</span>
              {selectedQuestionnaire && currentView !== 'form_selection' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {selectedQuestionnaire.collectionPath}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {currentView === 'form_selection' && 'Formularios Disponibles en Base de Datos'}
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
              Cambiar de Formulario
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

      {/* VIEW 1: Form Selection Hub (User explicitly requested: al ingresar poder revisar los formularios disponibles y en base a eso ver sus pestañas o datos) */}
      {currentView === 'form_selection' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-xl">
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Separación Estricta de Datos por Formulario</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Cada formulario posee su propia colección independiente en Firestore y gestiona su propio conjunto de datos, reportes, análisis y colaboradores. Selecciona el formulario que deseas inspeccionar para acceder a sus pestañas exclusivas.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questionnaires.map((q) => {
              const stats = formStats[q.id] || { total: 0, completed: 0, inProgress: 0, uniqueUsers: 0 };
              const isPerfil = q.id === 'perfil_profesional';

              return (
                <div 
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-400/80 transition-all p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        db: {q.collectionPath}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 size={12} /> Activo
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-display mb-1 flex items-center gap-2">
                      <FileText size={20} className="text-slate-800" />
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      {q.description}
                    </p>

                    {/* Form Metrics */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-center">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Envíos</span>
                        <span className="text-lg font-extrabold text-slate-800">{stats.total}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Completados</span>
                        <span className="text-lg font-extrabold text-emerald-600">{stats.completed}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Colaboradores</span>
                        <span className="text-lg font-extrabold text-slate-800">{stats.uniqueUsers}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectForm(q)}
                    className="w-full py-3 px-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Ingresar a Datos y Pestañas de este Formulario</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
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
          
          {/* Active Tab Content strictly passing the selected questionnaire */}
          <div className="flex-1 bg-white">
            {activeTab === 'usuarios' && (
              <AdminUsersList 
                questionnaire={selectedQuestionnaire} 
                onUserSelect={handleUserSelect} 
              />
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
            />
          ) : (
            <SummaryScreen
              profile={selectedEval.profile}
              answers={selectedEval.answers}
              onReset={() => {}}
              readOnly={true}
            />
          )}
        </div>
      )}

      {/* VIEW 5: Evaluation Section by Section Detail */}
      {currentView === 'eval_detail' && selectedEval && (
        <AdminEvaluationSections evalDoc={selectedEval} />
      )}
    </motion.div>
  );
}
