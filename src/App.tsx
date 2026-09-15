/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActiveStep, UserProfile, QuestionnaireAnswers, PerfilProfesionalAnswers } from './types';
import { INITIAL_ANSWERS } from './components/questionnaires/servicio_al_cliente/data';
import { INITIAL_PERFIL_ANSWERS, PERFIL_STEPS_METADATA } from './components/questionnaires/perfil_profesional/data';
import { saveEvaluation, EvaluationDocument } from './lib/firebase';

// Subcomponents - Servicio al Cliente
import WelcomeScreen from './components/WelcomeScreen';
import SectionContainer from './components/questionnaires/servicio_al_cliente/SectionContainer';
import Section1 from './components/questionnaires/servicio_al_cliente/Section1';
import Section2 from './components/questionnaires/servicio_al_cliente/Section2';
import Section3 from './components/questionnaires/servicio_al_cliente/Section3';
import Section4 from './components/questionnaires/servicio_al_cliente/Section4';
import Section5 from './components/questionnaires/servicio_al_cliente/Section5';
import Section6 from './components/questionnaires/servicio_al_cliente/Section6';
import SummaryScreen from './components/questionnaires/servicio_al_cliente/SummaryScreen';

// Subcomponents - Perfil Profesional (Website Oficial)
import SectionRolTrayectoria from './components/questionnaires/perfil_profesional/SectionRolTrayectoria';
import SectionHabilidadesLogros from './components/questionnaires/perfil_profesional/SectionHabilidadesLogros';
import SectionPasionCultura from './components/questionnaires/perfil_profesional/SectionPasionCultura';
import SectionPresenciaPrivacidad from './components/questionnaires/perfil_profesional/SectionPresenciaPrivacidad';
import SummaryScreenPerfil from './components/questionnaires/perfil_profesional/SummaryScreenPerfil';

// Admin components
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';

import { Cloud, CloudLightning, CloudOff, CloudCog, Globe, Headphones } from 'lucide-react';

const SERVICIO_STEPS_METADATA: { id: ActiveStep; label: string }[] = [
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
  
  // Active questionnaire selector: 'servicio_al_cliente' or 'perfil_profesional'
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<'servicio_al_cliente' | 'perfil_profesional'>('servicio_al_cliente');
  
  const [activeStep, setActiveStep] = useState<ActiveStep>('welcome');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    acceptedConsent: false
  });

  // State for Servicio al Cliente
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS);

  // State for Perfil Profesional
  const [perfilAnswers, setPerfilAnswers] = useState<PerfilProfesionalAnswers>(INITIAL_PERFIL_ANSWERS);

  const [evaluationId, setEvaluationId] = useState<string>('');
  const [editToken, setEditToken] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'local'>('local');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hydrate states from localStorage on component mount
  useEffect(() => {
    try {
      const storedQId = localStorage.getItem('fhons_questionnaire_id');
      const storedProfile = localStorage.getItem('fhons_profile');
      const storedAnswers = localStorage.getItem('fhons_answers');
      const storedPerfilAnswers = localStorage.getItem('fhons_perfil_answers');
      const storedStep = localStorage.getItem('fhons_step');
      const storedEvalId = localStorage.getItem('fhons_evaluation_id');
      const storedToken = localStorage.getItem('fhons_edit_token');

      if (storedQId === 'perfil_profesional' || storedQId === 'servicio_al_cliente') {
        setSelectedQuestionnaireId(storedQId);
      }
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedAnswers) {
        setAnswers(JSON.parse(storedAnswers));
      }
      if (storedPerfilAnswers) {
        setPerfilAnswers(JSON.parse(storedPerfilAnswers));
      }
      if (storedStep) {
        setActiveStep(storedStep as ActiveStep);
      }
      if (storedEvalId) {
        setEvaluationId(storedEvalId);
        setSyncStatus('synced');
      }
      if (storedToken) {
        setEditToken(storedToken);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
  }, []);

  // Save changes to localStorage and Firestore on updates
  const saveState = async (
    newProfile: UserProfile,
    newStep: ActiveStep,
    qId: 'servicio_al_cliente' | 'perfil_profesional' = selectedQuestionnaireId,
    activeId?: string,
    overrideAnswers?: QuestionnaireAnswers | PerfilProfesionalAnswers
  ) => {
    try {
      localStorage.setItem('fhons_questionnaire_id', qId);
      localStorage.setItem('fhons_profile', JSON.stringify(newProfile));
      localStorage.setItem('fhons_step', newStep);

      const targetId = activeId || evaluationId;
      const isPerfil = qId === 'perfil_profesional';
      const currentAnswers = overrideAnswers || (isPerfil ? perfilAnswers : answers);

      if (isPerfil) {
        localStorage.setItem('fhons_perfil_answers', JSON.stringify(currentAnswers));
      } else {
        localStorage.setItem('fhons_answers', JSON.stringify(currentAnswers));
      }

      if (targetId) {
        localStorage.setItem('fhons_evaluation_id', targetId);
        setSyncStatus('syncing');
        try {
          const isCompleted = isPerfil ? newStep === 'perfil_summary' : newStep === 'summary';
          const collectionPath = isPerfil ? 'evaluations_perfil_profesional' : 'evaluations_servicio_al_cliente';
          
          const currentToken = editToken || (currentAnswers as any)?.editToken || newProfile.editToken;

          const returnedToken = await saveEvaluation(
            targetId,
            newProfile,
            currentAnswers,
            isCompleted ? 'completed' : 'in_progress',
            newStep,
            collectionPath,
            qId,
            currentToken
          );
          
          if (returnedToken && returnedToken !== editToken) {
            setEditToken(returnedToken);
            localStorage.setItem('fhons_edit_token', returnedToken);
          }
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

  const handleStart = (
    updatedProfile: UserProfile, 
    qId: 'servicio_al_cliente' | 'perfil_profesional' = selectedQuestionnaireId,
    existingId?: string
  ) => {
    const newId = existingId || ('eval_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
    setEvaluationId(newId);
    setProfile(updatedProfile);
    setSelectedQuestionnaireId(qId);

    const firstStep: ActiveStep = qId === 'perfil_profesional' ? 'perfil_section1' : 'section1';
    setActiveStep(firstStep);
    saveState(updatedProfile, firstStep, qId, newId);
  };

  const handleLoadEvaluation = (evalDoc: EvaluationDocument, isEditing: boolean = false) => {
    const isPerfil = evalDoc.questionnaireId === 'perfil_profesional' || evalDoc.answers?.cargo !== undefined;
    const qId: 'servicio_al_cliente' | 'perfil_profesional' = isPerfil ? 'perfil_profesional' : 'servicio_al_cliente';
    
    setSelectedQuestionnaireId(qId);
    setProfile(evalDoc.profile);
    setEvaluationId(evalDoc.id);

    const token = evalDoc.editToken || evalDoc.answers?.editToken || evalDoc.profile?.editToken;
    if (token) {
      setEditToken(token);
      localStorage.setItem('fhons_edit_token', token);
    }

    if (isPerfil) {
      setPerfilAnswers(evalDoc.answers as PerfilProfesionalAnswers);
      // When editing is requested, ALWAYS bring user to section 1 of the form to edit
      const stepToGo: ActiveStep = isEditing
        ? 'perfil_section1'
        : (evalDoc.status === 'completed' 
            ? 'perfil_summary' 
            : (evalDoc.currentStep as ActiveStep || 'perfil_section1'));
      setActiveStep(stepToGo);
      localStorage.setItem('fhons_perfil_answers', JSON.stringify(evalDoc.answers));
      localStorage.setItem('fhons_step', stepToGo);
    } else {
      setAnswers(evalDoc.answers as QuestionnaireAnswers);
      const stepToGo: ActiveStep = isEditing
        ? 'section1'
        : (evalDoc.status === 'completed' 
            ? 'summary' 
            : (evalDoc.currentStep as ActiveStep || 'section1'));
      setActiveStep(stepToGo);
      localStorage.setItem('fhons_answers', JSON.stringify(evalDoc.answers));
      localStorage.setItem('fhons_step', stepToGo);
    }

    localStorage.setItem('fhons_questionnaire_id', qId);
    localStorage.setItem('fhons_profile', JSON.stringify(evalDoc.profile));
    localStorage.setItem('fhons_evaluation_id', evalDoc.id);
    setSyncStatus('synced');
  };

  const handleNext = () => {
    setValidationError(null);

    // Validations for Servicio al Cliente
    if (selectedQuestionnaireId === 'servicio_al_cliente') {
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
      saveState(profile, nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validations for Perfil Profesional
    if (selectedQuestionnaireId === 'perfil_profesional') {
      if (activeStep === 'perfil_section1') {
        if (!perfilAnswers.cargo.trim()) {
          setValidationError('Por favor indica tu cargo oficial en FHONS (Pregunta 1 - Obligatoria).');
          return;
        }
        if (!perfilAnswers.queHaces.trim()) {
          setValidationError('Por favor describe brevemente qué haces y cuál es tu función en FHONS (Pregunta 1 - Obligatoria).');
          return;
        }
        if (!perfilAnswers.fechaIngreso.trim()) {
          setValidationError('Por favor selecciona la fecha desde cuándo trabajas en FHONS (Pregunta 2 - Obligatoria).');
          return;
        }
        if (!perfilAnswers.aniosExperiencia.trim()) {
          setValidationError('Por favor indica tus años de experiencia acumulada (Pregunta 3 - Obligatoria).');
          return;
        }
      }

      if (activeStep === 'perfil_section2') {
        // Pregunta 4: Habilidades y Especialidades Principales es obligatoria
        if (!perfilAnswers.habilidadesEspecialidades || perfilAnswers.habilidadesEspecialidades.length === 0) {
          setValidationError('Por favor selecciona o escribe al menos una habilidad o especialidad principal (Pregunta 4 - Obligatoria).');
          return;
        }
        // Preguntas 5 y 6 son opcionales
      }

      if (activeStep === 'perfil_section3') {
        // Preguntas 7 y 8 son opcionales
        // Pregunta 9: Tres palabras que te describen es obligatoria
        const words = perfilAnswers.tresPalabras || ['', '', ''];
        if (!words[0]?.trim() || !words[1]?.trim() || !words[2]?.trim()) {
          setValidationError('Por favor completa las tres palabras que te describen (Pregunta 9 - Obligatoria).');
          return;
        }
        // Pregunta 10: Hobbies o pasatiempos es obligatoria
        if (!perfilAnswers.hobbies?.trim()) {
          setValidationError('Por favor cuéntanos sobre tus hobbies o pasatiempos (Pregunta 10 - Obligatoria).');
          return;
        }
        // Pregunta 11 es opcional
      }

      if (activeStep === 'perfil_section4') {
        // Preguntas 12, 13, 14, 15, 16 son opcionales
        // Pregunta 17: Preferencia de fotografía es obligatoria
        if (!perfilAnswers.fotoPreferencia) {
          setValidationError('Por favor selecciona una preferencia para tu fotografía de perfil: si ya tienes una foto o prefieres coordinar una toma (Pregunta 17 - Obligatoria).');
          return;
        }
        // Pregunta 18 es opcional
      }

      let nextStep: ActiveStep = 'welcome';
      switch (activeStep) {
        case 'perfil_section1':
          nextStep = 'perfil_section2';
          break;
        case 'perfil_section2':
          nextStep = 'perfil_section3';
          break;
        case 'perfil_section3':
          nextStep = 'perfil_section4';
          break;
        case 'perfil_section4':
          nextStep = 'perfil_summary';
          break;
        default:
          nextStep = 'perfil_summary';
      }
      setActiveStep(nextStep);
      saveState(profile, nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setValidationError(null);

    if (selectedQuestionnaireId === 'servicio_al_cliente') {
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
      saveState(profile, prevStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (selectedQuestionnaireId === 'perfil_profesional') {
      let prevStep: ActiveStep = 'welcome';
      switch (activeStep) {
        case 'perfil_section1':
          prevStep = 'welcome';
          break;
        case 'perfil_section2':
          prevStep = 'perfil_section1';
          break;
        case 'perfil_section3':
          prevStep = 'perfil_section2';
          break;
        case 'perfil_section4':
          prevStep = 'perfil_section3';
          break;
        default:
          prevStep = 'welcome';
      }
      setActiveStep(prevStep);
      saveState(profile, prevStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswersChange = (sectionKey: keyof QuestionnaireAnswers, updatedSectionAnswers: any) => {
    const updatedAnswers = {
      ...answers,
      [sectionKey]: updatedSectionAnswers
    };
    setAnswers(updatedAnswers);
    saveState(profile, activeStep, 'servicio_al_cliente', undefined, updatedAnswers);
  };

  const handlePerfilAnswersChange = (updatedAnswers: PerfilProfesionalAnswers) => {
    setPerfilAnswers(updatedAnswers);
    saveState(profile, activeStep, 'perfil_profesional', undefined, updatedAnswers);
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
    setPerfilAnswers(INITIAL_PERFIL_ANSWERS);
    setActiveStep('welcome');
    setEvaluationId('');
    setEditToken('');
    setSyncStatus('local');
    try {
      localStorage.removeItem('fhons_profile');
      localStorage.removeItem('fhons_answers');
      localStorage.removeItem('fhons_perfil_answers');
      localStorage.removeItem('fhons_step');
      localStorage.removeItem('fhons_evaluation_id');
      localStorage.removeItem('fhons_edit_token');
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  };

  const isPerfil = selectedQuestionnaireId === 'perfil_profesional';
  const isPerfilStep = activeStep.startsWith('perfil_');

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-200" id="app-root-container">
      
      {/* Header Navigation */}
      <header className="w-full h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-10 shrink-0 mb-6 shadow-xs" id="global-navbar">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPerfil ? 'bg-emerald-700' : 'bg-slate-900'}`}>
            {isPerfil ? (
              <Globe size={16} className="text-white" />
            ) : (
              <span className="text-white font-bold text-xs">S</span>
            )}
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-850 block font-display">
              {isPerfil ? 'Perfil Profesional FHONS' : 'Soporte TI de Excelencia'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              {isPerfil ? 'Ficha para Website Oficial de la Compañía' : 'Cuestionario de Autoevaluación Introspectivo'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {isPerfil ? 'Plataforma Web FHONS' : 'Portal de Excelencia'}
          </span>
          <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {isPerfil ? 'Ref: Perfil Público y Colaboradores' : 'Ref: Cuestionario de Agente TI'}
          </span>
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
                className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Volver al Dashboard
              </button>
              <div className="text-right">
                <p className="font-bold text-slate-800">{adminEvalToView.profile.name}</p>
                <p className="text-xs text-slate-500">{adminEvalToView.profile.email}</p>
              </div>
            </div>
            {adminEvalToView.questionnaireId === 'perfil_profesional' || adminEvalToView.answers?.cargo !== undefined ? (
              <SummaryScreenPerfil
                profile={adminEvalToView.profile}
                answers={adminEvalToView.answers}
                onReset={() => setViewMode('admin_dashboard')}
                readOnly={true}
                editToken={adminEvalToView.editToken || adminEvalToView.answers?.editToken || adminEvalToView.profile?.editToken}
              />
            ) : (
              <SummaryScreen
                profile={adminEvalToView.profile}
                answers={adminEvalToView.answers}
                onReset={() => setViewMode('admin_dashboard')}
                readOnly={true}
              />
            )}
          </div>
        )}

        {/* User View: Welcome Screen */}
        {viewMode === 'user' && activeStep === 'welcome' && (
          <WelcomeScreen
            onStart={handleStart}
            onLoadEvaluation={handleLoadEvaluation}
            onAdminLogin={() => {
              setViewMode('admin_login');
            }}
            initialProfile={profile}
            selectedQuestionnaireId={selectedQuestionnaireId}
            onSelectQuestionnaire={(id) => {
              setSelectedQuestionnaireId(id);
              localStorage.setItem('fhons_questionnaire_id', id);
            }}
          />
        )}

        {/* User View: Servicio al Cliente Questions */}
        {viewMode === 'user' && !isPerfilStep && activeStep !== 'welcome' && activeStep !== 'summary' && (
          <SectionContainer
            currentStep={activeStep}
            steps={SERVICIO_STEPS_METADATA}
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

        {/* User View: Servicio al Cliente Summary */}
        {viewMode === 'user' && activeStep === 'summary' && (
          <SummaryScreen
            profile={profile}
            answers={answers}
            onReset={handleReset}
          />
        )}

        {/* User View: Perfil Profesional Questions */}
        {viewMode === 'user' && isPerfilStep && activeStep !== 'perfil_summary' && (
          <SectionContainer
            currentStep={activeStep}
            steps={PERFIL_STEPS_METADATA}
            onBack={handleBack}
            onNext={handleNext}
            validationError={validationError}
          >
            {activeStep === 'perfil_section1' && (
              <SectionRolTrayectoria
                answers={perfilAnswers}
                profile={profile}
                onChange={handlePerfilAnswersChange}
              />
            )}
            {activeStep === 'perfil_section2' && (
              <SectionHabilidadesLogros
                answers={perfilAnswers}
                onChange={handlePerfilAnswersChange}
              />
            )}
            {activeStep === 'perfil_section3' && (
              <SectionPasionCultura
                answers={perfilAnswers}
                onChange={handlePerfilAnswersChange}
              />
            )}
            {activeStep === 'perfil_section4' && (
              <SectionPresenciaPrivacidad
                answers={perfilAnswers}
                onChange={handlePerfilAnswersChange}
              />
            )}
          </SectionContainer>
        )}

        {/* User View: Perfil Profesional Summary */}
        {viewMode === 'user' && activeStep === 'perfil_summary' && (
          <SummaryScreenPerfil
            profile={profile}
            answers={perfilAnswers}
            onReset={handleReset}
            onEdit={() => {
              setActiveStep('perfil_section1');
              saveState(profile, 'perfil_section1');
            }}
            editToken={editToken || perfilAnswers.editToken || profile.editToken}
          />
        )}
      </main>

    </div>
  );
}
