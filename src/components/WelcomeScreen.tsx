/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
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
  Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { listEvaluations, deleteEvaluation, EvaluationDocument } from '../lib/firebase';

interface WelcomeScreenProps {
  onStart: (profile: UserProfile, questionnaireId: 'servicio_al_cliente' | 'perfil_profesional', existingId?: string) => void;
  onLoadEvaluation: (evalDoc: EvaluationDocument) => void;
  onAdminLogin: () => void;
  initialProfile: UserProfile;
  selectedQuestionnaireId: 'servicio_al_cliente' | 'perfil_profesional';
  onSelectQuestionnaire: (id: 'servicio_al_cliente' | 'perfil_profesional') => void;
}

export default function WelcomeScreen({ 
  onStart, 
  onLoadEvaluation, 
  onAdminLogin, 
  initialProfile,
  selectedQuestionnaireId,
  onSelectQuestionnaire
}: WelcomeScreenProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  
  // Database states
  const [detectedEvaluations, setDetectedEvaluations] = useState<EvaluationDocument[]>([]);
  const [checkingDb, setCheckingDb] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const targetCollection = selectedQuestionnaireId === 'perfil_profesional' 
    ? 'evaluations_perfil_profesional' 
    : 'evaluations_servicio_al_cliente';

  // Validate email format
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Trigger Firestore search automatically when email becomes valid or questionnaire changes
  useEffect(() => {
    let active = true;
    const emailToSearch = profile.email.trim();

    if (isValidEmail(emailToSearch)) {
      setCheckingDb(true);
      listEvaluations(emailToSearch, targetCollection)
        .then((records) => {
          if (active) {
            setDetectedEvaluations(records);
          }
        })
        .catch((err) => {
          console.error('Error fetching assessments internally', err);
        })
        .finally(() => {
          if (active) {
            setCheckingDb(false);
          }
        });
    } else {
      setDetectedEvaluations([]);
      setCheckingDb(false);
    }

    return () => {
      active = false;
    };
  }, [profile.email, selectedQuestionnaireId, targetCollection]);

  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro de la base de datos de Firestore? Esta acción no se puede deshacer.')) {
      return;
    }
    setIsDeletingId(id);
    try {
      await deleteEvaluation(id, targetCollection);
      // Refresh list
      const records = await listEvaluations(profile.email.trim(), targetCollection);
      setDetectedEvaluations(records);
    } catch (error) {
      console.error('Error deleting evaluation', error);
      alert('Error al intentar eliminar el registro de la base de datos.');
    } finally {
      setIsDeletingId(null);
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
      newErrors.email = 'Por favor ingresa un correo electrónico válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && profile.acceptedConsent) {
      onStart(profile, selectedQuestionnaireId);
    }
  };

  const isFormValid = profile.acceptedConsent && profile.name.trim() && isValidEmail(profile.email.trim());

  const isPerfil = selectedQuestionnaireId === 'perfil_profesional';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto w-full flex items-center justify-center py-6 md:py-10"
      id="welcome-screen-container"
    >
      {/* Centered Main 2-Column Card */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden grid grid-cols-1 md:grid-cols-12 w-full max-w-5xl min-h-[640px]" id="technical-assessment-card">
        
        {/* Left Column: Workshop / Profile Information */}
        <div className="md:col-span-5 bg-[#0b1329] p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden" id="card-left-side">
          {/* Background subtle glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-slate-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Evaluation Badge */}
            <div>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block font-mono">
                {isPerfil ? 'Website Oficial FHONS' : 'Autoevaluación TI'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight font-display mt-2">
              {isPerfil ? (
                <>
                  Perfil Profesional<br />
                  <span className="text-white">FHONS</span>
                </>
              ) : (
                <>
                  Soporte TI<br />
                  <span className="text-white">de Excelencia</span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-xs leading-relaxed font-sans font-light">
              {isPerfil
                ? 'Cuestionario para crear tu perfil público en el website oficial de la compañía: trayectoria, especialidades, pasiones y datos biográficos.'
                : 'Este sistema evalúa la empatía, el ownership y los criterios de servicio basados en los 8 pilares fundamentales de atención técnica.'}
            </p>

            {/* Circular points list */}
            <div className="space-y-4 pt-2" id="bullet-points">
              {isPerfil ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-blue-700/80 bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-blue-300 font-mono font-semibold">
                      1
                    </div>
                    <p className="text-slate-300 text-xs leading-normal font-sans">
                      Tu nombre, apellido y correo corporativo se registrarán automáticamente a partir de tu acceso para no duplicar preguntas.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-blue-700/80 bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-blue-300 font-mono font-semibold">
                      2
                    </div>
                    <p className="text-slate-300 text-xs leading-normal font-sans">
                      Sin análisis psicológico. Tú decides qué destacar en tu ficha web y cuentas con control de privacidad para datos confidenciales.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-slate-700/80 bg-slate-800/30 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-slate-400 font-mono font-semibold">
                      1
                    </div>
                    <p className="text-slate-400 text-xs leading-normal font-sans">
                      Tus respuestas se utilizan estrictamente para el desarrollo de tus habilidades blandas y el proceso técnico.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border border-slate-700/80 bg-slate-800/30 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-slate-400 font-mono font-semibold">
                      2
                    </div>
                    <p className="text-slate-400 text-xs leading-normal font-sans">
                      No existen respuestas erróneas, solo reflexiones honestas para potenciar tu empatía con el cliente.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Copyright footer */}
          <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-8 pt-6 border-t border-slate-800/60 relative z-10" id="card-left-footer">
            {isPerfil ? '© 2026 FHONS. PERFIL PROFESIONAL WEB OFICIAL.' : '© 2026 SOPORTE TI DE EXCELENCIA. TODOS LOS DERECHOS RESERVADOS.'}
          </div>
        </div>

        {/* Right Column: Questionnaire Selection & User Identification */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-white relative" id="card-right-side">
          <button
            type="button"
            onClick={onAdminLogin}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 transition rounded-full hover:bg-slate-50 cursor-pointer"
            title="Acceso Administrativo"
          >
            <Shield size={18} />
          </button>
          
          <div>
            {/* Questionnaire Selector Tabs */}
            <div className="mb-6">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                Selecciona el Cuestionario a Realizar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => onSelectQuestionnaire('servicio_al_cliente')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedQuestionnaireId === 'servicio_al_cliente'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Headphones size={15} className="shrink-0 text-blue-600" />
                  <span className="truncate">Soporte TI de Excelencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectQuestionnaire('perfil_profesional')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedQuestionnaireId === 'perfil_profesional'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe size={15} className="shrink-0 text-emerald-600" />
                  <span className="truncate">Perfil Profesional Web</span>
                </button>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-850 font-display">
                Identificación del Colaborador
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                {isPerfil
                  ? 'Ingresa tus datos institucionales. Tu nombre, correo y fecha se asociarán a tu perfil web sin necesidad de volver a pedirlos en el formulario.'
                  : 'Por favor introduce tus datos para habilitar el cuestionario de autoevaluación.'}
              </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4" id="identification-form">
              
              {/* Row: Name and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="user-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5 font-mono">
                    Nombre Completo *
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#f8fafc] border ${
                      errors.name ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-slate-900/5 focus:border-slate-400'
                    } rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-sans focus:bg-white`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-0.5 ml-0.5">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="evaluation-date" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5 font-mono">
                    Fecha de Registro
                  </label>
                  <input
                    id="evaluation-date"
                    type="date"
                    value={profile.date}
                    onChange={(e) => setProfile({ ...profile, date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all font-sans focus:bg-white"
                  />
                </div>
              </div>

              {/* Row: Corporate Email */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="user-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5 font-mono">
                    Correo Electrónico Institucional *
                  </label>
                  {/* Subtle Firestore checking indicator */}
                  {checkingDb && (
                    <span className="flex items-center gap-1 text-[10px] text-blue-500 font-mono">
                      <Loader2 size={10} className="animate-spin" />
                      Buscando en Firestore...
                    </span>
                  )}
                </div>
                <input
                  id="user-email"
                  type="email"
                  placeholder="usuario@fhons.com.do"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className={`w-full px-4 py-3 bg-[#f8fafc] border ${
                    errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-slate-900/5 focus:border-slate-400'
                  } rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-sans focus:bg-white`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-0.5 ml-0.5">{errors.email}</p>}
              </div>

              {/* Checkbox Consent */}
              <div className="pt-2 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent"
                  checked={profile.acceptedConsent}
                  onChange={(e) => setProfile({ ...profile, acceptedConsent: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer mt-0.5 accent-slate-950 shrink-0"
                />
                <label htmlFor="consent" className="text-[11px] text-slate-500 leading-normal cursor-pointer select-none">
                  {isPerfil
                    ? 'Confirmo que la información suministrada es verídica y autorizo su uso para la creación de mi perfil en el website oficial de FHONS conforme a mis preferencias de publicación.'
                    : 'Acepto participar honestamente en este cuestionario de autoevaluación, asumiendo un compromiso sincero con la excelencia en el soporte técnico.'}
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="start-questionnaire-btn"
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-4 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  isFormValid 
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/5' 
                    : 'bg-[#e2e8f0] text-slate-400'
                }`}
              >
                {isPerfil ? 'Comenzar Perfil Profesional' : 'Comenzar Evaluación'}
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

          {/* Detected Firestore Records list */}
          <AnimatePresence>
            {detectedEvaluations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-5 border-t border-slate-150 space-y-3 overflow-hidden"
                id="detected-sessions-expander"
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Database size={13} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      Registros previos ({isPerfil ? 'Perfil Web' : 'Soporte TI'}):
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {detectedEvaluations.length} encontrado(s)
                  </span>
                </div>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1" id="detected-records-scroll">
                  {detectedEvaluations.map((item) => {
                    const isCompleted = item.status === 'completed';

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-850 text-[11px] truncate">{item.profile.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                              isCompleted 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isCompleted ? 'Listo' : 'En Progreso'}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{item.profile.date}</span>
                            {item.answers?.cargo && (
                              <span className="text-slate-600 truncate">• {item.answers.cargo}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onLoadEvaluation(item)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-bold cursor-pointer transition flex items-center gap-0.5"
                          >
                            {isCompleted ? 'Ver' : 'Reanudar'}
                            <Play size={8} />
                          </button>
                          
                          <button
                            type="button"
                            disabled={isDeletingId === item.id}
                            onClick={(e) => handleDeleteDoc(item.id, e)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-30"
                            title="Eliminar registro"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
