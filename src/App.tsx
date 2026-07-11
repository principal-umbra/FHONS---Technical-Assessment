/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActiveStep, UserProfile, QuestionnaireAnswers } from './types';
import { INITIAL_ANSWERS } from './components/questionnaires/servicio_al_cliente/data';
import { saveEvaluation, EvaluationDocument } from './lib/firebase';

// Subcomponents
import WelcomeScreen from './components/WelcomeScreen';
import SectionContainer from './components/questionnaires/servicio_al_cliente/SectionContainer';
import Section1 from './components/questionnaires/servicio_al_cliente/Section1';
import Section2 from './components/questionnaires/servicio_al_cliente/Section2';
import Section3 from './components/questionnaires/servicio_al_cliente/Section3';
import Section4 from './components/questionnaires/servicio_al_cliente/Section4';
import Section5 from './components/questionnaires/servicio_al_cliente/Section5';
import Section6 from './components/questionnaires/servicio_al_cliente/Section6';
import SummaryScreen from './components/questionnaires/servicio_al_cliente/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';

import { Cloud, CloudLightning, CloudOff, CloudCog } from 'lucide-react';

const STEPS_METADATA: { id: ActiveStep; label: string }[] = [
  { id: 'welcome', label: 'Bienvenida' },
  { id: 'section1', label: '1. Atención vs Servicio' },
  { id: 'section2', label: '2. Los 8 Pilares' },
  { id: 'section3', label: '3. Mentalidad y Proceso' },
  { id: 'section4', label: '4. Habilidades Clave' },
  { id: 'section5', label: '5. Trabajo en Equipo' },
  { id: 'section6', label: '6. Cierre y Compromiso' },
  { id: 'summary', label: 'Resumen y Reporte' }
];

export default function App() {
  const [viewMode, setViewMode] = useState<'user' | 'admin_login' | 'admin_dashboard' | 'admin_view_eval'>('user');
  const [adminEvalToView, setAdminEvalToView] = useState<EvaluationDocument | null>(null);
  const [activeStep, setActiveStep] = useState<ActiveStep>('welcome');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    acceptedConsent: false
  });
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS);
  const [evaluationId, setEvaluationId] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'local'>('local');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hydrate states from localStorage on component mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('fhons_profile');
      const storedAnswers = localStorage.getItem('fhons_answers');
      const storedStep = localStorage.getItem('fhons_step');
      const storedEvalId = localStorage.getItem('fhons_evaluation_id');

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedAnswers) {
        setAnswers(JSON.parse(storedAnswers));
      }
      if (storedStep) {
        setActiveStep(storedStep as ActiveStep);
      }
      if (storedEvalId) {
        setEvaluationId(storedEvalId);
        setSyncStatus('synced');
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
  }, []);

  // Save changes to localStorage and Firestore on updates
  const saveState = async (
    newProfile: UserProfile,
    newAnswers: QuestionnaireAnswers,
    newStep: ActiveStep,
    activeId?: string
  ) => {
    try {
      localStorage.setItem('fhons_profile', JSON.stringify(newProfile));
      localStorage.setItem('fhons_answers', JSON.stringify(newAnswers));
      localStorage.setItem('fhons_step', newStep);

      const targetId = activeId || evaluationId;
      if (targetId) {
        localStorage.setItem('fhons_evaluation_id', targetId);
        setSyncStatus('syncing');
        try {
          const isCompleted = newStep === 'summary';
          await saveEvaluation(targetId, newProfile, newAnswers, isCompleted ? 'completed' : 'in_progress', newStep);
          setSyncStatus('synced');
        } catch (err) {
          console.error('Error auto-saving to Firestore:', err);
          setSyncStatus('error');
        }
      }
    } catch (e) {
      console.error('Error saving state', e);
    }
  };

  const handleStart = (updatedProfile: UserProfile) => {
    const newId = 'eval_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    setEvaluationId(newId);
    setProfile(updatedProfile);
    setActiveStep('section1');
    saveState(updatedProfile, answers, 'section1', newId);
  };

  const handleLoadEvaluation = (evalDoc: EvaluationDocument) => {
    setProfile(evalDoc.profile);
    setAnswers(evalDoc.answers);
    setActiveStep(evalDoc.currentStep || 'section1');
    setEvaluationId(evalDoc.id);
    
    localStorage.setItem('fhons_profile', JSON.stringify(evalDoc.profile));
    localStorage.setItem('fhons_answers', JSON.stringify(evalDoc.answers));
    localStorage.setItem('fhons_step', evalDoc.currentStep || 'section1');
    localStorage.setItem('fhons_evaluation_id', evalDoc.id);
    setSyncStatus('synced');
  };

  const handleNext = () => {
    setValidationError(null);

    // Section 6 validations
    if (activeStep === 'section6') {
      if (!answers.section6.commitmentText.trim()) {
        setValidationError('Debes redactar tu compromiso de servicio personal antes de finalizar.');
        return;
      }
      if (!answers.section6.signature.trim()) {
        setValidationError('La Firma Digital es obligatoria para concluir el cuestionario.');
        return;
      }
    }

    let nextStep: ActiveStep = 'welcome';
    switch (activeStep) {
      case 'section1':
        nextStep = 'section2';
        break;
      case 'section2':
        nextStep = 'section3';
        break;
      case 'section3':
        nextStep = 'section4';
        break;
      case 'section4':
        nextStep = 'section5';
        break;
      case 'section5':
        nextStep = 'section6';
        break;
      case 'section6':
        nextStep = 'summary';
        break;
      default:
        nextStep = 'summary';
    }
    setActiveStep(nextStep);
    saveState(profile, answers, nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setValidationError(null);
    let prevStep: ActiveStep = 'welcome';
    switch (activeStep) {
      case 'section1':
        prevStep = 'welcome';
        break;
      case 'section2':
        prevStep = 'section1';
        break;
      case 'section3':
        prevStep = 'section2';
        break;
      case 'section4':
        prevStep = 'section3';
        break;
      case 'section5':
        prevStep = 'section4';
        break;
      case 'section6':
        prevStep = 'section5';
        break;
      default:
        prevStep = 'welcome';
    }
    setActiveStep(prevStep);
    saveState(profile, answers, prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswersChange = (sectionKey: keyof QuestionnaireAnswers, updatedSectionAnswers: any) => {
    const updatedAnswers = {
      ...answers,
      [sectionKey]: updatedSectionAnswers
    };
    setAnswers(updatedAnswers);
    saveState(profile, updatedAnswers, activeStep);
  };

  const handleReset = () => {
    const defaultProfile = {
      name: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
      acceptedConsent: false
    };
    setProfile(defaultProfile);
    setAnswers(INITIAL_ANSWERS);
    setActiveStep('welcome');
    setEvaluationId('');
    setSyncStatus('local');
    try {
      localStorage.removeItem('fhons_profile');
      localStorage.removeItem('fhons_answers');
      localStorage.removeItem('fhons_step');
      localStorage.removeItem('fhons_evaluation_id');
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-200" id="app-root-container">
      
      {/* Header Navigation */}
      <header className="w-full h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-10 shrink-0 mb-6 shadow-xs" id="global-navbar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-800 block">Soporte TI de Excelencia</span>
            <span className="text-[10px] text-slate-400 font-medium block">Cuestionario de Autoevaluación Introspectivo</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">Portal de Excelencia</span>
          <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">Ref: Cuestionario de Agente de Soporte TI</span>
          <div className="hidden sm:block h-4 w-[1px] bg-slate-200"></div>
          
          {/* Firestore Sync Indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500" id="firestore-sync-indicator">
            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 text-blue-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                <CloudCog size={13} className="animate-spin" />
                <span>Syncing</span>
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-mono text-[10px] font-bold uppercase tracking-wider" title="Firestore Sincronizado">
                <Cloud size={13} />
                <span>Synced</span>
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-rose-500 font-mono text-[10px] font-bold uppercase tracking-wider" title="Error al guardar en Firestore">
                <CloudLightning size={13} />
                <span>Offline</span>
              </span>
            )}
            {syncStatus === 'local' && (
              <span className="inline-flex items-center gap-1.5 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <CloudOff size={13} />
                <span>Local</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Primary router container */}
      <main className="flex-1 py-4 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto flex flex-col justify-center" id="primary-view-router">
        {viewMode === 'admin_login' && (
          <LoginScreen
            onBack={() => setViewMode('user')}
            onLoginSuccess={() => setViewMode('admin_dashboard')}
          />
        )}

        {viewMode === 'admin_dashboard' && (
          <AdminDashboard
            onBack={() => setViewMode('user')}
          />
        )}

        {viewMode === 'admin_view_eval' && adminEvalToView && (
          <div className="w-full">
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setViewMode('admin_dashboard')}
                className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition"
              >
                Volver al Dashboard
              </button>
              <div className="text-right">
                <p className="font-bold text-slate-800">{adminEvalToView.profile.name}</p>
                <p className="text-xs text-slate-500">{adminEvalToView.profile.email}</p>
              </div>
            </div>
            <SummaryScreen
              profile={adminEvalToView.profile}
              answers={adminEvalToView.answers}
              onReset={() => setViewMode('admin_dashboard')}
              readOnly={true}
            />
          </div>
        )}

        {viewMode === 'user' && activeStep === 'welcome' && (
          <WelcomeScreen
            onStart={handleStart}
            onLoadEvaluation={handleLoadEvaluation}
            onAdminLogin={() => {
              setViewMode('admin_login');
            }}
            initialProfile={profile}
          />
        )}

        {viewMode === 'user' && activeStep !== 'welcome' && activeStep !== 'summary' && (
          <SectionContainer
            currentStep={activeStep}
            steps={STEPS_METADATA}
            onBack={handleBack}
            onNext={handleNext}
            validationError={validationError}
          >
            {activeStep === 'section1' && (
              <Section1
                answers={answers.section1}
                onChange={(secAnswers) => handleAnswersChange('section1', secAnswers)}
              />
            )}
            {activeStep === 'section2' && (
              <Section2
                answers={answers.section2}
                onChange={(secAnswers) => handleAnswersChange('section2', secAnswers)}
              />
            )}
            {activeStep === 'section3' && (
              <Section3
                answers={answers.section3}
                onChange={(secAnswers) => handleAnswersChange('section3', secAnswers)}
              />
            )}
            {activeStep === 'section4' && (
              <Section4
                answers={answers.section4}
                onChange={(secAnswers) => handleAnswersChange('section4', secAnswers)}
              />
            )}
            {activeStep === 'section5' && (
              <Section5
                answers={answers.section5}
                onChange={(secAnswers) => handleAnswersChange('section5', secAnswers)}
              />
            )}
            {activeStep === 'section6' && (
              <Section6
                answers={answers.section6}
                onChange={(secAnswers) => handleAnswersChange('section6', secAnswers)}
              />
            )}
          </SectionContainer>
        )}

        {viewMode === 'user' && activeStep === 'summary' && (
          <SummaryScreen
            profile={profile}
            answers={answers}
            onReset={handleReset}
          />
        )}
      </main>

    </div>
  );
}
