import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, QuestionnaireAssignment, Questionnaire } from '../types';
import { 
  User, 
  Mail, 
  Calendar, 
  Play, 
  Database, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Shield, 
  Globe, 
  Headphones, 
  CheckCircle2, 
  Lock,
  Key,
  AlertCircle,
  Edit3,
  Check,
  FileText,
  X,
  Layers,
  Clock,
  UserCheck,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  Moon,
  Inbox,
  Server,
  Briefcase,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Award,
  AlertTriangle,
  Search,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  listAllUserEvaluations, 
  deleteEvaluation, 
  EvaluationDocument,
  getAssignmentsByEmail,
  getQuestionnaires,
  DEFAULT_QUESTIONNAIRES
} from '../lib/firebase';

interface WelcomeScreenProps {
  onStart: (profile: UserProfile, questionnaireId: string, existingId?: string) => void;
  onLoadEvaluation: (evalDoc: EvaluationDocument, isEditing?: boolean) => void;
  onAdminLogin: () => void;
  initialProfile: UserProfile;
  selectedQuestionnaireId: string;
  onSelectQuestionnaire: (id: string) => void;
}

interface AssignedQuestionnaireItem {
  questionnaire: Questionnaire;
  assignment?: QuestionnaireAssignment;
  existingEvaluation?: EvaluationDocument;
  status: 'pending' | 'in_progress' | 'abierto_pendiente' | 'completed';
}

export default function WelcomeScreen({ 
  onStart, 
  onLoadEvaluation, 
  onAdminLogin, 
  initialProfile, 
  selectedQuestionnaireId,
  onSelectQuestionnaire
}: WelcomeScreenProps) {
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    acceptedConsent: true
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  
  // Database detection states
  const [assignedItems, setAssignedItems] = useState<AssignedQuestionnaireItem[]>([]);
  const [detectedEvaluations, setDetectedEvaluations] = useState<EvaluationDocument[]>([]);
  const [checkingDb, setCheckingDb] = useState<boolean>(false);
  const [hasQueried, setHasQueried] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Filter tab for the Agent Hub: default 'todo' (shows pending, in_progress, and abierto_pendiente)
  const [filterTab, setFilterTab] = useState<'todo' | 'abierto_pendiente' | 'pending' | 'in_progress' | 'completed' | 'all'>('todo');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const pendingCount = useMemo(() => assignedItems.filter(i => i.status === 'pending').length, [assignedItems]);
  const abiertoCount = useMemo(() => assignedItems.filter(i => i.status === 'abierto_pendiente').length, [assignedItems]);
  const inProgressCount = useMemo(() => assignedItems.filter(i => i.status === 'in_progress').length, [assignedItems]);
  const completedCount = useMemo(() => assignedItems.filter(i => i.status === 'completed').length, [assignedItems]);
  const toDoCount = useMemo(() => pendingCount + abiertoCount + inProgressCount, [pendingCount, abiertoCount, inProgressCount]);

  const filteredItems = useMemo(() => {
    return assignedItems.filter(item => {
      // Status Tab filter
      if (filterTab === 'todo') {
        const isToDo = item.status === 'pending' || item.status === 'abierto_pendiente' || item.status === 'in_progress';
        if (!isToDo) return false;
      } else if (filterTab === 'abierto_pendiente') {
        if (item.status !== 'abierto_pendiente') return false;
      } else if (filterTab === 'pending') {
        if (item.status !== 'pending') return false;
      } else if (filterTab === 'in_progress') {
        if (item.status !== 'in_progress') return false;
      } else if (filterTab === 'completed') {
        if (item.status !== 'completed') return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const title = (item.questionnaire.title || '').toLowerCase();
        const desc = (item.questionnaire.description || '').toLowerCase();
        const cat = (item.questionnaire.category || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      }

      return true;
    });
  }, [assignedItems, filterTab, searchQuery]);

  // Inline editing of name in Hub header
  const [isEditingName, setIsEditingName] = useState(false);

  // Free/Open selection fallback toggle (for demos or if admin enabled all forms)
  const [showAllFormsMode, setShowAllFormsMode] = useState<boolean>(false);

  // Dedicated modal for editing any selected evaluation with token
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<EvaluationDocument | null>(null);
  const [modalTokenInput, setModalTokenInput] = useState<string>('');
  const [modalTokenError, setModalTokenError] = useState<string | null>(null);
  const [isVerifyingModalToken, setIsVerifyingModalToken] = useState<boolean>(false);
  const [modalTokenSuccess, setModalTokenSuccess] = useState<boolean>(false);

  // Direct Token Edit Mode
  const [entryMode, setEntryMode] = useState<'assigned' | 'edit_with_token'>('assigned');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenSuccess, setTokenSuccess] = useState<boolean>(false);

  const getQuestionnaireIcon = (qId: string) => {
    switch (qId) {
      case 'perfil_profesional':
        return <Globe size={22} className="text-emerald-600" />;
      case 'servicio_al_cliente':
        return <Headphones size={22} className="text-blue-600" />;
      case 'proceso_retroalimentacion':
        return <ShieldAlert size={22} className="text-rose-600" />;
      case 'proceso_guardia':
        return <Moon size={22} className="text-indigo-600" />;
      case 'protocolo_tickets':
        return <Inbox size={22} className="text-purple-600" />;
      case 'protocolo_migraciones':
        return <Server size={22} className="text-cyan-600" />;
      case 'protocolo_visitas':
        return <Briefcase size={22} className="text-amber-600" />;
      default:
        return <FileText size={22} className="text-slate-600" />;
    }
  };

  const isPerfil = selectedQuestionnaireId === 'perfil_profesional';
  
  const existingActiveDoc = detectedEvaluations.find(
    d => d.questionnaireId === selectedQuestionnaireId
  ) || null;

  // Validate email format
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email.trim());
  };

  // Query Firestore for assigned questionnaires and existing evaluations when email is valid
  useEffect(() => {
    let active = true;
    const cleanEmail = profile.email.trim().toLowerCase();

    if (isValidEmail(cleanEmail)) {
      setCheckingDb(true);
      setHasQueried(true);

      Promise.all([
        getAssignmentsByEmail(cleanEmail).catch(() => [] as QuestionnaireAssignment[]),
        listAllUserEvaluations(cleanEmail).catch(() => [] as EvaluationDocument[]),
        getQuestionnaires().catch(() => DEFAULT_QUESTIONNAIRES)
      ])
        .then(([assignments, evals, allQuestionnaires]) => {
          if (!active) return;

          setDetectedEvaluations(evals);

          // Auto-prefill name if found in existing evaluations or assignments
          if (!profile.name.trim()) {
            const foundName = evals[0]?.profile?.name || assignments[0]?.agentName;
            if (foundName) {
              setProfile(prev => ({ ...prev, name: foundName }));
            }
          }

          // Build assigned questionnaire items list
          const itemsMap = new Map<string, AssignedQuestionnaireItem>();

          // 1. Process explicit assignments
          assignments.forEach(a => {
            const matchedQ = allQuestionnaires.find(q => q.id === a.questionnaireId) || {
              id: a.questionnaireId,
              title: a.questionnaireTitle || a.questionnaireId,
              description: 'Cuestionario asignado por la administración.',
              collectionPath: `evaluations_${a.questionnaireId}`,
              uiPath: a.questionnaireId
            };

            const existingEval = evals.find(e => e.questionnaireId === a.questionnaireId);
            const status: 'pending' | 'in_progress' | 'abierto_pendiente' | 'completed' = 
              existingEval ? existingEval.status : a.status || 'pending';

            itemsMap.set(a.questionnaireId, {
              questionnaire: matchedQ,
              assignment: a,
              existingEvaluation: existingEval,
              status
            });
          });

          // 2. Also include any questionnaires where user already has evaluations in Firestore
          evals.forEach(e => {
            const qId = e.questionnaireId || (e.answers?.cargo !== undefined ? 'perfil_profesional' : 'servicio_al_cliente');
            if (!itemsMap.has(qId)) {
              const matchedQ = allQuestionnaires.find(q => q.id === qId) || {
                id: qId,
                title: qId === 'perfil_profesional' ? 'Perfil Profesional FHONS (Web Oficial)' : 'Soporte TI de Excelencia',
                description: 'Cuestionario con registros previos en base de datos.',
                collectionPath: `evaluations_${qId}`,
                uiPath: qId
              };

              itemsMap.set(qId, {
                questionnaire: matchedQ,
                existingEvaluation: e,
                status: e.status
              });
            }
          });

          const consolidated = Array.from(itemsMap.values());
          setAssignedItems(consolidated);

          // If the currently selected questionnaire is in the assigned list, keep it;
          // otherwise if there's at least one assigned, select the first assigned one
          if (consolidated.length > 0) {
            const isCurrentAssigned = consolidated.some(i => i.questionnaire.id === selectedQuestionnaireId);
            if (!isCurrentAssigned) {
              const firstId = consolidated[0].questionnaire.id;
              onSelectQuestionnaire(firstId);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching agent questionnaires:', err);
        })
        .finally(() => {
          if (active) setCheckingDb(false);
        });
    } else {
      setAssignedItems([]);
      setDetectedEvaluations([]);
      setCheckingDb(false);
      setHasQueried(false);
    }

    return () => {
      active = false;
    };
  }, [profile.email]);

  const handleDeleteDoc = async (item: EvaluationDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro de Firestore? Esta acción no se puede deshacer.')) {
      return;
    }
    setIsDeletingId(item.id);
    const targetColl = item.questionnaireId === 'perfil_profesional' 
      ? 'evaluations_perfil_profesional' 
      : 'evaluations_servicio_al_cliente';
    try {
      await deleteEvaluation(item.id, targetColl);
      const records = await listAllUserEvaluations(profile.email.trim());
      setDetectedEvaluations(records);
    } catch (error) {
      console.error('Error deleting evaluation', error);
      alert('Error al intentar eliminar el registro.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleOpenEditModal = (docItem: EvaluationDocument) => {
    setSelectedDocForEdit(docItem);
    setModalTokenInput('');
    setModalTokenError(null);
    setModalTokenSuccess(false);
    setIsVerifyingModalToken(false);
  };

  const handleVerifyModalToken = () => {
    if (!selectedDocForEdit) return;

    const cleanToken = modalTokenInput.trim().toUpperCase();
    if (!cleanToken) {
      setModalTokenError('Por favor ingresa tu código o Token de Edición.');
      return;
    }

    setIsVerifyingModalToken(true);
    setModalTokenError(null);

    const storedToken = (
      selectedDocForEdit.editToken || 
      selectedDocForEdit.answers?.editToken || 
      selectedDocForEdit.profile?.editToken || 
      ''
    ).trim().toUpperCase();

    const matches = storedToken ? cleanToken === storedToken : cleanToken.length >= 3;

    if (matches) {
      setModalTokenSuccess(true);
      setTimeout(() => {
        onLoadEvaluation(selectedDocForEdit, true); // edit mode!
      }, 500);
    } else {
      setIsVerifyingModalToken(false);
      setModalTokenError('El Token ingresado no coincide con el código de esta ficha. Verifica el código otorgado.');
    }
  };

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!profile.name.trim()) {
      newErrors.name = 'El nombre completo es requerido para continuar.';
    }
    if (!profile.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else if (!isValidEmail(profile.email)) {
      newErrors.email = 'Por favor ingresa un correo electrónico institucional válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartQuestionnaire = (targetQId: string, existingEval?: EvaluationDocument) => {
    let currentName = profile.name.trim();
    if (!currentName) {
      const fallbackName = existingEval?.profile?.name || assignedItems[0]?.assignment?.agentName;
      if (fallbackName) {
        currentName = fallbackName;
        setProfile(prev => ({ ...prev, name: fallbackName }));
      } else {
        setErrors({ name: 'Por favor confirma tu nombre completo antes de iniciar.' });
        return;
      }
    }

    const currentProfile: UserProfile = {
      ...profile,
      name: currentName,
      acceptedConsent: true
    };

    setErrors({});

    // If existing eval is in progress or abierto_pendiente, load directly for the verified agent
    if (existingEval) {
      if (existingEval.status === 'abierto_pendiente' || existingEval.status === 'in_progress') {
        onSelectQuestionnaire(targetQId);
        onLoadEvaluation(existingEval, true);
        return;
      }
      handleOpenEditModal(existingEval);
      return;
    }

    onSelectQuestionnaire(targetQId);
    onStart(currentProfile, targetQId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (existingActiveDoc) {
        if (existingActiveDoc.status === 'abierto_pendiente' || existingActiveDoc.status === 'in_progress') {
          onLoadEvaluation(existingActiveDoc, true);
          return;
        }
        handleOpenEditModal(existingActiveDoc);
        return;
      }
      onStart(profile, selectedQuestionnaireId);
    }
  };

  const isFormValid = profile.name.trim() && isValidEmail(profile.email.trim());
  const hasAssignments = isValidEmail(profile.email) && !checkingDb && assignedItems.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className={`mx-auto w-full flex items-center justify-center py-4 md:py-8 transition-all ${
        hasAssignments ? 'max-w-6xl' : 'max-w-5xl'
      }`}
      id="welcome-screen-container"
    >
      {/* Centered Main 2-Column Card */}
      <div 
        className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden grid grid-cols-1 md:grid-cols-12 w-full transition-all min-h-[640px]" 
        id="technical-assessment-card"
      >
        
        {/* Left Column: Workshop / Profile Information */}
        <div 
          className={`${
            hasAssignments ? 'md:col-span-4 p-6 md:p-8' : 'md:col-span-5 p-8 md:p-12'
          } bg-[#0b1329] flex flex-col justify-between text-white relative overflow-hidden transition-all`} 
          id="card-left-side"
        >
          {/* Background subtle glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-slate-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Evaluation Badge */}
            <div>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block font-mono">
                FHONS Platform Hub • Sistema Operativo
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight font-display mt-1">
              Sistema de<br />
              <span className="text-blue-400">Cuestionarios FHONS</span>
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-xs leading-relaxed font-sans font-light">
              Plataforma institucional para la gestión, resolución y seguimiento de evaluaciones técnicas, fichas profesionales y protocolos operativos asignados a cada colaborador.
            </p>

            {/* Information points about the system */}
            <div className="space-y-3.5 pt-1" id="bullet-points">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border border-blue-700/80 bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-blue-300 font-mono font-semibold">
                  1
                </div>
                <p className="text-slate-300 text-xs leading-normal font-sans">
                  <strong>Acceso por correo corporativo:</strong> Ingresa tu correo institucional (@fhons.com.do) para consultar automáticamente el catálogo de cuestionarios habilitados y asignados a tu usuario.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border border-blue-700/80 bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-blue-300 font-mono font-semibold">
                  2
                </div>
                <p className="text-slate-300 text-xs leading-normal font-sans">
                  <strong>Reglas y criterios propios:</strong> Cada cuestionario posee su propia metodología y requisitos internos (desde autodiagnósticos y fichas de perfil hasta validaciones técnicas con metas específicas).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border border-blue-700/80 bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-blue-300 font-mono font-semibold">
                  3
                </div>
                <p className="text-slate-300 text-xs leading-normal font-sans">
                  <strong>Control de estados:</strong> Gestiona tu progreso según el estado de cada evaluación: por iniciar, borradores en progreso, cuestionarios abiertos para completar y módulos finalizados.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border border-blue-700/80 bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-blue-300 font-mono font-semibold">
                  4
                </div>
                <p className="text-slate-300 text-xs leading-normal font-sans">
                  <strong>Guardado en tiempo real & Token:</strong> Tus respuestas se registran de forma segura en la nube. Puedes pausar, reanudar o consultar tus registros con tu Token único de seguridad.
                </p>
              </div>
            </div>

            {/* Quick status badge if user is logged in with assignments */}
            {hasAssignments && (
              <div className="p-3 bg-blue-950/70 border border-blue-800/70 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-blue-300 uppercase tracking-wider font-bold">
                  <span>Tu Avance General</span>
                  <span>{completedCount} de {assignedItems.length} listos</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${assignedItems.length > 0 ? Math.round((completedCount / assignedItems.length) * 100) : 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>{toDoCount} por hacer</span>
                  <span className={abiertoCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {abiertoCount > 0 ? `${abiertoCount} abiertos pendientes` : 'Al día'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Copyright footer */}
          <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-8 pt-6 border-t border-slate-800/60 relative z-10" id="card-left-footer">
            © 2026 FHONS CORPORATION. TODOS LOS DERECHOS RESERVADOS.
          </div>
        </div>

        {/* Right Column: User Identification & Assigned Questionnaires */}
        <div 
          className={`${
            hasAssignments ? 'md:col-span-8 p-6 md:p-8' : 'md:col-span-7 p-8 md:p-12'
          } flex flex-col justify-between bg-white relative transition-all`} 
          id="card-right-side"
        >
          <button
            type="button"
            onClick={onAdminLogin}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 transition rounded-full hover:bg-slate-50 cursor-pointer"
            title="Acceso Administrativo"
          >
            <Shield size={18} />
          </button>
          
          <div className="space-y-6">

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Identificación del Agente
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                Bienvenido a FHONS
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Coloca tu correo corporativo para consultar los cuestionarios asignados a tu usuario.
              </p>
            </div>

            {/* Step 1: Corporate Email Input */}
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center">
                <label htmlFor="user-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1.5">
                  <Mail size={12} className="text-blue-600" />
                  Correo Electrónico Institucional *
                </label>
                {checkingDb && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-600 font-mono font-bold">
                    <Loader2 size={11} className="animate-spin" />
                    Consultando asignaciones...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="user-email"
                  type="email"
                  placeholder="ejemplo: tu_correo@fhons.com.do"
                  value={profile.email}
                  onChange={(e) => {
                    setProfile({ ...profile, email: e.target.value });
                    setTokenError(null);
                  }}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  } rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-sans font-medium`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
            </div>

            {/* Step 2: Dynamic Questionnaires Assigned Section */}
            {isValidEmail(profile.email) && !checkingDb && (
              <div className="space-y-4">
                {/* Case A: User has assigned questionnaires */}
                {assignedItems.length > 0 ? (
                  <div className="space-y-4">
                    {/* Agent Identity & Verified Email Banner */}
                    <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {(profile.name || profile.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {isEditingName ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={profile.name}
                                  placeholder="Escribe tu nombre completo..."
                                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                  className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => setIsEditingName(false)}
                                  className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  Guardar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {profile.name.trim() || 'Colaborador FHONS'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingName(true)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                                  title="Editar nombre"
                                >
                                  <Edit3 size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-blue-700 font-mono font-medium truncate flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-blue-600 shrink-0" />
                            <span>{profile.email}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({ ...prev, email: '', name: '' }));
                          setAssignedItems([]);
                        }}
                        className="text-[11px] text-slate-500 hover:text-rose-600 font-mono transition flex items-center gap-1 self-end sm:self-center cursor-pointer shrink-0 px-2 py-1 hover:bg-white/80 rounded-lg"
                        title="Cambiar correo corporativo"
                      >
                        <RefreshCw size={11} />
                        <span>Cambiar correo</span>
                      </button>
                    </div>

                    {/* Metric Quick Counters Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterTab('todo')}
                        className={`p-2.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
                          filterTab === 'todo'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                          <span>Por Hacer</span>
                          <Clock size={12} className={filterTab === 'todo' ? 'text-amber-400' : 'text-slate-400'} />
                        </div>
                        <div className="text-lg font-bold font-display mt-0.5">
                          {toDoCount}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFilterTab('abierto_pendiente')}
                        className={`p-2.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
                          filterTab === 'abierto_pendiente'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : abiertoCount > 0
                              ? 'bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-amber-300 ring-1 ring-amber-300/40'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold tracking-wider opacity-90">
                          <span>Abiertos Pend.</span>
                          <AlertCircle size={12} className={filterTab === 'abierto_pendiente' ? 'text-white' : 'text-amber-600'} />
                        </div>
                        <div className="text-lg font-bold font-display mt-0.5">
                          {abiertoCount}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFilterTab('pending')}
                        className={`p-2.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
                          filterTab === 'pending'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                          <span>Por Iniciar</span>
                          <Inbox size={12} className={filterTab === 'pending' ? 'text-white' : 'text-blue-500'} />
                        </div>
                        <div className="text-lg font-bold font-display mt-0.5">
                          {pendingCount}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFilterTab('completed')}
                        className={`p-2.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
                          filterTab === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                          <span>Completados</span>
                          <CheckCircle2 size={12} className={filterTab === 'completed' ? 'text-white' : 'text-emerald-500'} />
                        </div>
                        <div className="text-lg font-bold font-display mt-0.5">
                          {completedCount}
                        </div>
                      </button>
                    </div>

                    {/* Interactive Filter Tabs and Search Bar */}
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setFilterTab('todo')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                              filterTab === 'todo'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            <Clock size={12} className={filterTab === 'todo' ? 'text-amber-400' : 'text-slate-500'} />
                            <span>Por Hacer ({toDoCount})</span>
                          </button>

                          {abiertoCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setFilterTab('abierto_pendiente')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                filterTab === 'abierto_pendiente'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                              }`}
                            >
                              <AlertCircle size={12} />
                              <span>Abiertos Pendientes ({abiertoCount})</span>
                            </button>
                          )}

                          {pendingCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setFilterTab('pending')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                filterTab === 'pending'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                              }`}
                            >
                              <Inbox size={12} />
                              <span>Por Iniciar ({pendingCount})</span>
                            </button>
                          )}

                          {inProgressCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setFilterTab('in_progress')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                filterTab === 'in_progress'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                              }`}
                            >
                              <Clock size={12} />
                              <span>En Progreso ({inProgressCount})</span>
                            </button>
                          )}

                          {completedCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setFilterTab('completed')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                filterTab === 'completed'
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <CheckCircle2 size={12} />
                              <span>Completados ({completedCount})</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setFilterTab('all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              filterTab === 'all'
                                ? 'bg-slate-800 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <span>Todos ({assignedItems.length})</span>
                          </button>
                        </div>

                        {/* Search Input */}
                        {assignedItems.length > 2 && (
                          <div className="relative w-full sm:w-48 shrink-0">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Buscar..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-6 py-1.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Questionnaires Practical List */}
                    {filteredItems.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5">
                        <AlertCircle size={24} className="mx-auto text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-700">
                          No hay cuestionarios disponibles en este filtro
                        </h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          {filterTab === 'todo'
                            ? '¡Excelente! No tienes cuestionarios pendientes ni abiertos por hacer en este momento.'
                            : filterTab === 'abierto_pendiente'
                              ? 'No tienes cuestionarios con calificación menor al 95% pendientes de reintentar.'
                              : 'No se encontraron resultados para la vista seleccionada.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterTab('all');
                            setSearchQuery('');
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                          Ver todos los cuestionarios ({assignedItems.length})
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                        {filteredItems.map((item) => {
                          const q = item.questionnaire;
                          const isSelected = selectedQuestionnaireId === q.id;
                          const isCompleted = item.status === 'completed';
                          const isAbiertoPendiente = item.status === 'abierto_pendiente';
                          const isInProgress = item.status === 'in_progress';
                          const hasExistingDoc = !!item.existingEvaluation;
                          const score = (item.existingEvaluation as any)?.scorePercentage ?? (item.existingEvaluation?.answers as any)?.scorePercentage ?? item.assignment?.scorePercentage;

                          return (
                            <div
                              key={q.id}
                              onClick={() => onSelectQuestionnaire(q.id)}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                                isAbiertoPendiente
                                  ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300/40 hover:border-amber-400'
                                  : isSelected
                                    ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              {/* Top Banner / Status Highlight */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                    isAbiertoPendiente
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : isCompleted
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : isInProgress
                                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}>
                                    {getQuestionnaireIcon(q.id)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                                        {q.title}
                                      </h4>
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                      {q.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Status Pill Badge */}
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isAbiertoPendiente
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                      : isInProgress
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle2 size={11} className="text-emerald-600" />
                                      <span>✓ Completado</span>
                                    </>
                                  ) : isAbiertoPendiente ? (
                                    <>
                                      <AlertCircle size={11} className="text-amber-700" />
                                      <span>⚠️ Abierto Pendiente</span>
                                    </>
                                  ) : isInProgress ? (
                                    <>
                                      <Clock size={11} className="text-blue-600" />
                                      <span>⚙️ En Progreso</span>
                                    </>
                                  ) : (
                                    <>
                                      <Inbox size={11} className="text-slate-500" />
                                      <span>📋 Por Iniciar</span>
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Alert message if abierto pendiente */}
                              {isAbiertoPendiente && (
                                <div className="p-2.5 bg-amber-100/70 border border-amber-300/80 rounded-xl flex items-center justify-between text-[11px] text-amber-950 font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <AlertCircle size={13} className="text-amber-700 shrink-0" />
                                    <span>
                                      {['proceso_retroalimentacion', 'proceso_guardia', 'protocolo_tickets', 'protocolo_migraciones', 'protocolo_visitas'].includes(q.id) ? (
                                        <>
                                          Calificación actual: <strong>{score !== undefined ? `${score}%` : 'Incompleta'}</strong> (Mínimo aprobatorio: 95%)
                                        </>
                                      ) : (
                                        <>
                                          Cuestionario abierto pendiente de finalizar o revisar respuestas.
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  {['proceso_retroalimentacion', 'proceso_guardia', 'protocolo_tickets', 'protocolo_migraciones', 'protocolo_visitas'].includes(q.id) && (
                                    <span className="font-bold underline text-amber-900 hidden sm:inline">
                                      Requiere superar 95%
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Supervisor Assignment Note if exists */}
                              {item.assignment?.notes && (
                                <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                                  Instrucción: {item.assignment.notes}
                                </p>
                              )}

                              {/* Action Footer */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {hasExistingDoc
                                    ? `Último registro: ${new Date(item.existingEvaluation!.updatedAt || item.existingEvaluation!.createdAt || Date.now()).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' })}`
                                    : 'Asignado a tu usuario • Listo para comenzar'}
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  {hasExistingDoc && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(item.existingEvaluation!);
                                      }}
                                      className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                    >
                                      <Key size={11} className="text-amber-600" />
                                      Editar con Token
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectQuestionnaire(q.id);
                                      handleStartQuestionnaire(
                                        q.id,
                                        item.existingEvaluation
                                      );
                                    }}
                                    className={`px-3.5 py-1.5 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                                      isAbiertoPendiente
                                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                                        : isCompleted
                                          ? 'bg-emerald-600 hover:bg-emerald-700'
                                          : isInProgress
                                            ? 'bg-slate-800 hover:bg-slate-900'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                    }`}
                                  >
                                    <span>
                                      {isAbiertoPendiente
                                        ? 'Reintentar / Completar'
                                        : isCompleted
                                          ? 'Ver Resultados'
                                          : isInProgress
                                            ? 'Continuar'
                                            : 'Iniciar Cuestionario'}
                                    </span>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Case B: No assignments found for this email */
                  <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-amber-900">
                          No se encontraron cuestionarios asignados
                        </h4>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          No tienes cuestionarios asignados actualmente para <strong>{profile.email}</strong>. Comunícate con tu supervisor o el administrador de FHONS para que te asigne la evaluación correspondiente.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAllFormsMode(true)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                      >
                        Explorar cuestionarios públicos / modo libre
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, email: '' }))}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                      >
                        Probar con otro correo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fallback / Free mode toggle if no assignment or explicitly requested */}
            {showAllFormsMode && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                  Selección Libre de Cuestionario (Modo Exploración):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {DEFAULT_QUESTIONNAIRES.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onSelectQuestionnaire(q.id);
                        handleStartQuestionnaire(q.id);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-left cursor-pointer ${
                        selectedQuestionnaireId === q.id
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                          : 'text-slate-600 hover:bg-white/60'
                      }`}
                    >
                      <Layers size={13} className="text-blue-600 shrink-0" />
                      <span className="truncate">{q.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Quick Access to Token Direct Edit Modal */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>¿Ya completaste un cuestionario y tienes tu Token?</span>
            {detectedEvaluations.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenEditModal(detectedEvaluations[0])}
                className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Key size={12} />
                Validar Token
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Token Edit Modal */}
      <AnimatePresence>
        {selectedDocForEdit && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Key size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Editar Formulario con Token</h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedDocForEdit.questionnaireId === 'perfil_profesional' ? 'Perfil Profesional FHONS' : 'Soporte TI de Excelencia'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDocForEdit(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingresa el <strong>Token de Edición</strong> exclusivo que se generó al completar o guardar tu ficha para <span className="font-semibold text-slate-900">{selectedDocForEdit.profile.email}</span>.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 font-mono">
                    Token o Código de Edición *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. FH-95A5SV"
                    value={modalTokenInput}
                    onChange={(e) => {
                      setModalTokenInput(e.target.value.toUpperCase());
                      setModalTokenError(null);
                    }}
                    className="w-full px-4 py-3 bg-amber-50/50 border-2 border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 tracking-wider placeholder:font-sans uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {modalTokenError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{modalTokenError}</span>
                  </p>
                )}

                {modalTokenSuccess && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>¡Token validado! Abriendo tus datos para editar...</span>
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocForEdit(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyModalToken}
                    disabled={isVerifyingModalToken || !modalTokenInput.trim()}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isVerifyingModalToken ? <Loader2 size={13} className="animate-spin" /> : <Edit3 size={13} />}
                    <span>Validar y Editar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
