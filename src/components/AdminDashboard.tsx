import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ArrowLeft, Users, BarChart3, FlaskConical, Settings } from 'lucide-react';
import { EvaluationDocument } from '../lib/firebase';
import AdminUsersList from './AdminUsersList';
import AdminUserDetail from './AdminUserDetail';
import AdminEvaluationSections from './AdminEvaluationSections';
import AdminReports from './AdminReports';
import AdminLaboratory from './AdminLaboratory';
import AdminSettings from './AdminSettings';
import SummaryScreen from './questionnaires/servicio_al_cliente/SummaryScreen';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'reportes' | 'laboratorio' | 'configuraciones'>('usuarios');
  const [currentView, setCurrentView] = useState<'tabs' | 'user_detail' | 'eval_report' | 'eval_detail'>('tabs');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<EvaluationDocument | null>(null);

  const handleLogout = () => {
    onBack();
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
    if (currentView === 'tabs') {
      onBack();
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
      className="max-w-7xl mx-auto w-full py-8 md:py-12 px-4"
    >
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-400 hover:text-slate-800 transition rounded-full hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">
              {currentView === 'tabs' && 'Dashboard Administrativo'}
              {currentView === 'user_detail' && `Evaluaciones de ${selectedUserEmail}`}
              {currentView === 'eval_report' && 'Reporte Final'}
              {currentView === 'eval_detail' && 'Detalle del Cuestionario'}
            </h1>
            <p className="text-sm text-slate-500">
              {currentView === 'tabs' && 'Centro de control y análisis'}
              {currentView !== 'tabs' && 'Vista detallada'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>

      {currentView === 'tabs' && (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden min-h-[600px] flex flex-col">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition ${
                activeTab === 'usuarios' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users size={18} /> Usuarios
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition ${
                activeTab === 'reportes' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={18} /> Reportes
            </button>
            <button
              onClick={() => setActiveTab('laboratorio')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition ${
                activeTab === 'laboratorio' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FlaskConical size={18} /> Laboratorio
            </button>
            <button
              onClick={() => setActiveTab('configuraciones')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition ${
                activeTab === 'configuraciones' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings size={18} /> Configuraciones
            </button>
          </div>
          
          <div className="flex-1 bg-slate-50/50">
            {activeTab === 'usuarios' && <AdminUsersList onUserSelect={handleUserSelect} />}
            {activeTab === 'reportes' && <AdminReports onViewReport={handleViewReport} onViewDetail={handleViewDetail} />}
            {activeTab === 'laboratorio' && <AdminLaboratory />}
            {activeTab === 'configuraciones' && <AdminSettings />}
          </div>
        </div>
      )}

      {currentView === 'user_detail' && selectedUserEmail && (
        <AdminUserDetail 
          email={selectedUserEmail} 
          onViewReport={handleViewReport}
          onViewDetail={handleViewDetail}
        />
      )}

      {currentView === 'eval_report' && selectedEval && (
        <div className="w-full">
          <SummaryScreen
            profile={selectedEval.profile}
            answers={selectedEval.answers}
            onReset={() => {}}
            readOnly={true}
          />
        </div>
      )}

      {currentView === 'eval_detail' && selectedEval && (
        <AdminEvaluationSections evalDoc={selectedEval} />
      )}
    </motion.div>
  );
}