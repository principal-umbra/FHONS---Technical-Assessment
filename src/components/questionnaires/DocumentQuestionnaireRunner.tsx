import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Lock, 
  Key, 
  FileCheck, 
  FileText, 
  Printer, 
  Check, 
  Clock, 
  Building2, 
  User, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile } from '../../types';
import { QuizQuestion } from './proceso_retroalimentacion/data';
import { generateEditToken } from '../../lib/firebase';

interface DocumentSection {
  num: string;
  title: string;
  badge?: string;
  content: string;
}

interface DocumentMaterial {
  title: string;
  company: string;
  intro: string;
  sections: DocumentSection[];
}

interface DocumentQuestionnaireRunnerProps {
  material: DocumentMaterial;
  questions: QuizQuestion[];
  questionnaireId: string;
  profile: UserProfile;
  initialAnswers?: Record<string, string>;
  initialReadingConfirmed?: boolean;
  initialScore?: number;
  initialSignature?: string;
  initialStatus?: 'pending' | 'abierto_pendiente' | 'completed';
  initialToken?: string;
  onSaveProgress: (answers: Record<string, string>, status: 'abierto_pendiente' | 'completed', score: number, signature?: string, token?: string) => Promise<void>;
  onBackToHub?: () => void;
}

export default function DocumentQuestionnaireRunner({
  material,
  questions = [],
  questionnaireId,
  profile,
  initialAnswers = {},
  initialReadingConfirmed = false,
  initialScore = 0,
  initialSignature = '',
  initialStatus = 'pending',
  initialToken = '',
  onSaveProgress,
  onBackToHub
}: DocumentQuestionnaireRunnerProps) {
  const safeInitialAnswers: Record<string, string> = 
    (initialAnswers && typeof initialAnswers === 'object') ? initialAnswers : {};

  // Steps: 'reading' | 'quiz' | 'result_failed' | 'certification' | 'summary_completed'
  const [currentStep, setCurrentStep] = useState<'reading' | 'quiz' | 'result_failed' | 'certification' | 'summary_completed'>(
    initialStatus === 'completed' 
      ? 'summary_completed' 
      : (initialReadingConfirmed && safeInitialAnswers.readingConfirmed) 
        ? 'quiz' 
        : 'reading'
  );

  // Phase 1: Reading confirmation
  const [readingConfirmed, setReadingConfirmed] = useState<boolean>(Boolean(initialReadingConfirmed));
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [openedSections, setOpenedSections] = useState<Set<number>>(() => {
    if (initialReadingConfirmed && material?.sections) {
      return new Set((material?.sections || []).map((_, i) => i));
    }
    return new Set<number>();
  });

  const totalSections = material?.sections?.length || 0;
  const allSectionsRead = totalSections > 0 && openedSections.size >= totalSections;

  const handleToggleSection = (idx: number) => {
    setExpandedSection(prev => {
      if (prev === idx) {
        return null;
      }
      setOpenedSections(current => {
        const next = new Set(current);
        next.add(idx);
        return next;
      });
      return idx;
    });
  };

  // Phase 2: Quiz answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => safeInitialAnswers || {});
  const [unansweredErrors, setUnansweredErrors] = useState<string[]>([]);

  // Phase 3: Score and evaluation
  const [scorePercentage, setScorePercentage] = useState<number>(initialScore || 0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState<QuizQuestion[]>([]);
  const [attempts, setAttempts] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  // Phase 4: Final signature and certification
  const [signatureName, setSignatureName] = useState<string>(initialSignature || profile?.name || '');
  const [acceptedCommitment, setAcceptedCommitment] = useState<boolean>(false);
  const [issuedToken, setIssuedToken] = useState<string>(initialToken || profile?.editToken || '');
  const [certifiedDate, setCertifiedDate] = useState<string>(new Date().toISOString());

  // Handle option select
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...(prev || {}),
      [questionId]: optionId
    }));
    setUnansweredErrors(prev => (prev || []).filter(id => id !== questionId));
  };

  // Evaluate quiz submissions
  const handleEvaluateQuiz = async () => {
    const currentAns = selectedAnswers || {};
    // Validate all questions are answered
    const unanswered = (questions || []).filter(q => !currentAns[q.id]).map(q => q.id);
    if (unanswered.length > 0) {
      setUnansweredErrors(unanswered);
      try {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } catch (e) {
        // ignore
      }
      return;
    }

    setSaving(true);
    let correct = 0;
    const incorrect: QuizQuestion[] = [];

    (questions || []).forEach(q => {
      const userAnswer = currentAns[q.id];
      if (userAnswer === q.correctAnswer) {
        correct++;
      } else {
        incorrect.push(q);
      }
    });

    const calculatedScore = Math.round((correct / Math.max((questions || []).length, 1)) * 100);
    setCorrectCount(correct);
    setIncorrectQuestions(incorrect);
    setScorePercentage(calculatedScore);

    // Rule: Must score between 95% and 100% to pass
    const isPassed = calculatedScore >= 95;

    if (isPassed) {
      const token = issuedToken || generateEditToken();
      setIssuedToken(token);
      setCurrentStep('certification');
      // Save progress as temporarily pending signature
      await onSaveProgress(currentAns, 'in_progress' as any, calculatedScore, signatureName, token);
    } else {
      // Failed: status MUST be 'abierto_pendiente' (instead of 'pending')
      setCurrentStep('result_failed');
      await onSaveProgress(currentAns, 'abierto_pendiente', calculatedScore);
    }
    setSaving(false);
  };

  // Handle final certification signature
  const handleSignAndCertify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim()) {
      alert('Por favor introduce tu nombre completo como firma.');
      return;
    }
    if (!acceptedCommitment) {
      alert('Por favor marca la casilla de declaración jurada y compromiso formal.');
      return;
    }

    setSaving(true);
    const token = issuedToken || generateEditToken();
    setIssuedToken(token);
    const now = new Date().toISOString();
    setCertifiedDate(now);

    try {
      await onSaveProgress(selectedAnswers || {}, 'completed', scorePercentage, signatureName.trim(), token);
      setCurrentStep('summary_completed');
    } catch (err) {
      console.error('Error certifying submission:', err);
      alert('Error al registrar la certificación.');
    } finally {
      setSaving(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setAttempts(prev => prev + 1);
    setCurrentStep('quiz');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // ignore
    }
  };

  const handleBackToRead = () => {
    setCurrentStep('reading');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSectionContent = (content: string) => {
    const paragraphs = content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return (
      <div className="space-y-3.5 text-slate-800 text-xs sm:text-[13px] font-sans leading-relaxed">
        {paragraphs.map((para, idx) => {
          const isBullet = para.startsWith('•') || para.startsWith('- ') || para.startsWith('* ');
          if (isBullet) {
            const cleanText = para.replace(/^[•\-\*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="text-blue-600 font-bold text-base leading-none shrink-0 mt-0.5">•</span>
                <p className="leading-relaxed flex-1 text-slate-800">{cleanText}</p>
              </div>
            );
          }

          return (
            <p key={idx} className="leading-relaxed text-slate-800">
              {para}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 space-y-6" id="document-questionnaire-root">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Volver al panel"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                {material.company}
              </span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] font-mono text-slate-500">
                Puntaje mínimo de aprobación: 95%
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              {material.title}
            </h1>
          </div>
        </div>

        {/* Phase progress indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            currentStep === 'reading' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-500'
          }`}>
            1. Lectura
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            currentStep === 'quiz' || currentStep === 'result_failed'
              ? 'bg-blue-600 text-white' 
              : currentStep === 'certification' || currentStep === 'summary_completed'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-400'
          }`}>
            2. Evaluación
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            currentStep === 'certification' || currentStep === 'summary_completed'
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            3. Certificación
          </span>
        </div>
      </div>

      {/* PHASE 1: Official Material Reading */}
      {currentStep === 'reading' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <BookOpen size={160} />
            </div>
            <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-500/30">
                <BookOpen size={12} />
                Fase 1: Lectura Obligatoria del Documento
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {material.title}
              </h2>
              <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                {material.intro.split('\n').filter(p => p.trim()).map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Document Sections List */}
          <div className="space-y-4">
            {material.sections.map((sec, idx) => {
              const isOpen = expandedSection === idx;
              const hasBeenRead = openedSections.has(idx);

              return (
                <div 
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOpen 
                      ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                      : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div 
                    onClick={() => handleToggleSection(idx)}
                    className={`p-5 flex items-center justify-between cursor-pointer select-none transition ${
                      isOpen ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center shrink-0 transition ${
                        isOpen 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : hasBeenRead 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-900 text-white'
                      }`}>
                        {hasBeenRead && !isOpen ? <Check size={14} /> : sec.num}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm font-bold font-display transition ${
                            isOpen ? 'text-blue-900' : 'text-slate-900'
                          }`}>
                            {sec.title}
                          </h3>
                          {sec.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              {sec.badge}
                            </span>
                          )}
                          {hasBeenRead ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Check size={10} />
                              Leído
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                              Por leer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400 shrink-0 ml-3">
                      {isOpen ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Collapsible Content with animation */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                      >
                        <div className="p-5">
                          {renderSectionContent(sec.content)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Reading Confirmation Box */}
          <div className={`border-2 rounded-3xl p-6 space-y-4 shadow-sm transition-all ${
            allSectionsRead 
              ? 'bg-blue-50/70 border-blue-200' 
              : 'bg-slate-50/90 border-slate-200'
          }`}>
            {/* Progress of read sections */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  allSectionsRead ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                <span className="text-xs font-bold font-mono text-slate-800">
                  {allSectionsRead ? (
                    '✓ Todos los puntos han sido leídos y revisados'
                  ) : (
                    `Puntos leídos: ${openedSections.size} de ${totalSections}`
                  )}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {allSectionsRead ? (
                  <span className="text-emerald-700 font-bold">Casilla habilitada para confirmar</span>
                ) : (
                  <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-medium">
                    Abre cada punto para desbloquear la constancia
                  </span>
                )}
              </div>
            </div>

            {/* Checkbox (Grayed out and disabled until all sections are opened) */}
            <div className={`flex items-start gap-3 transition-opacity ${
              allSectionsRead ? 'opacity-100' : 'opacity-40 cursor-not-allowed select-none'
            }`}>
              <input
                type="checkbox"
                id="check-reading-confirmed"
                checked={readingConfirmed}
                disabled={!allSectionsRead}
                onChange={(e) => {
                  if (allSectionsRead) {
                    setReadingConfirmed(e.target.checked);
                  }
                }}
                className={`w-5 h-5 rounded mt-0.5 shrink-0 transition ${
                  allSectionsRead 
                    ? 'border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600' 
                    : 'border-slate-300 text-slate-400 bg-slate-200 cursor-not-allowed'
                }`}
              />
              <label 
                htmlFor={allSectionsRead ? "check-reading-confirmed" : undefined}
                className={`text-xs leading-relaxed font-medium ${
                  allSectionsRead 
                    ? 'text-slate-800 cursor-pointer select-none' 
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <strong>Constancia de Lectura Completa:</strong> Declaro que he abierto y leído detenidamente la totalidad de los {totalSections} puntos de este material oficial, comprendo las políticas, protocolos y responsabilidades explicadas, y me encuentro preparado(a) para completar el cuestionario evaluativo.
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!allSectionsRead || !readingConfirmed}
                onClick={() => {
                  if (allSectionsRead && readingConfirmed) {
                    setCurrentStep('quiz');
                    try {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (e) {
                      // ignore
                    }
                  }
                }}
                className={`py-3.5 px-6 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                  allSectionsRead && readingConfirmed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Proceder al Cuestionario Evaluativo ({(questions || []).length} Preguntas)</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PHASE 2: Interactive Quiz Form */}
      {currentStep === 'quiz' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Cuestionario Evaluativo • Intento #{attempts}
              </span>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Responde todas las preguntas con base en la documentación oficial
              </h2>
            </div>
            <button
              type="button"
              onClick={handleBackToRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline self-start sm:self-auto cursor-pointer"
            >
              Releer Documento
            </button>
          </div>

          {/* Validation Notice if unanswered */}
          {unansweredErrors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>
                Por favor responde las {unansweredErrors.length} preguntas faltantes marcadas en rojo para poder evaluar.
              </span>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-5">
            {(questions || []).map((q, index) => {
              const isUnanswered = (unansweredErrors || []).includes(q.id);
              const currentVal = (selectedAnswers || {})[q.id];

              return (
                <div
                  key={q.id}
                  id={`question-${q.id}`}
                  className={`bg-white rounded-3xl p-6 border-2 transition shadow-xs ${
                    isUnanswered 
                      ? 'border-rose-300 bg-rose-50/20' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {q.section}
                      </span>
                    </div>
                    {currentVal && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        <Check size={11} /> Respondida
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-4 font-sans">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2">
                    {(q.options || []).map((opt) => {
                      const isSelected = currentVal === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-xs leading-relaxed ${
                            isSelected ? 'font-bold text-slate-900' : 'text-slate-700'
                          }`}>
                            {opt.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Respondidas: {(questions || []).filter(q => Boolean((selectedAnswers || {})[q.id])).length} de {(questions || []).length}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleBackToRead}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Volver a Lectura
              </button>

              <button
                type="button"
                onClick={handleEvaluateQuiz}
                disabled={saving}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>{saving ? 'Evaluando...' : 'Evaluar Respuestas y Calificar'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PHASE 3: FAILED RESULT (< 95%) -> State: ABIERTO PENDIENTE */}
      {currentStep === 'result_failed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Failed Score Banner */}
          <div className="bg-amber-500/10 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900 px-3 py-1 rounded-full bg-amber-200">
                Estado: Abierto Pendiente (Requiere 95% - 100%)
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 font-display mt-2">
                Puntuación Obtenida: {scorePercentage}%
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                Has acertado {correctCount} de {questions.length} preguntas. El protocolo corporativo exige una calificación mínima del <strong>95%</strong> para considerar aprobada la evaluación.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Reintentar Evaluación (Ajustar Respuestas)</span>
              </button>

              <button
                type="button"
                onClick={handleBackToRead}
                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Releer Material Oficial
              </button>
            </div>
          </div>

          {/* Detailed Incorrect Breakdown */}
          {incorrectQuestions.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Puntos a Reforzar ({incorrectQuestions.length} preguntas por corregir):
                </h3>
              </div>

              <div className="space-y-3">
                {incorrectQuestions.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 text-xs space-y-1.5">
                    <p className="font-bold text-slate-900">{q.question}</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      <strong className="text-amber-900 font-mono">Fundamento del documento:</strong> {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* PHASE 4: CERTIFICATION SIGNATURE (>= 95%) */}
      {currentStep === 'certification' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border-2 border-emerald-500/30 shadow-xl p-6 sm:p-10 space-y-6"
        >
          {/* Passed Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Award size={36} />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ Calificación Sobresaliente: {scorePercentage}% de Aciertos
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              ¡Evaluación Aprobada con Excelencia!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Has demostrado dominio riguroso de las directrices de <strong>{material.title}</strong>. Para completar formalmente el proceso, firma la constancia de entendimiento y compromiso.
            </p>
          </div>

          <form onSubmit={handleSignAndCertify} className="space-y-4 max-w-xl mx-auto pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                Firma Digital (Nombre Completo del Agente) *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Andri Domínguez"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="check-formal-commitment"
                checked={acceptedCommitment}
                onChange={(e) => setAcceptedCommitment(e.target.checked)}
                className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5 accent-emerald-600 shrink-0"
              />
              <label 
                htmlFor="check-formal-commitment"
                className="text-xs text-emerald-950 leading-relaxed cursor-pointer select-none font-medium"
              >
                Acepto formalmente que he leído y entendido a cabalidad las disposiciones de <strong>{material.title}</strong>, asumiendo el compromiso de aplicar estos protocolos en mis funciones laborales en FHONS SRL.
              </label>
            </div>

            <button
              type="submit"
              disabled={saving || !acceptedCommitment || !signatureName.trim()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              <FileCheck size={16} />
              <span>{saving ? 'Certificando en Firestore...' : 'Firmar y Emitir Certificación Final'}</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* PHASE 5: COMPLETED CERTIFICATION RECEIPT */}
      {currentStep === 'summary_completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Certificate Print-Ready Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-xl space-y-8 relative overflow-hidden" id="official-certificate-card">
            {/* Top Certificate Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    Constancia Oficial de Cumplimiento
                  </span>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    FHONS SRL
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Token de Constancia</span>
                <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                  {issuedToken || 'FH-CERTIFIED'}
                </span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-center max-w-xl mx-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-bold bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                Certificación de Conocimiento Aprobada ({scorePercentage}%)
              </span>
              <h3 className="text-2xl font-bold font-display text-slate-900">
                {material.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se hace constar que el colaborador <strong>{signatureName || profile.name}</strong> ({profile.email}) ha leído íntegramente el material normativo, completado el cuestionario evaluativo con una calificación aprobatoria de excelencia y firmado el compromiso de observancia y cumplimiento.
              </p>
            </div>

            {/* Signature & Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 bg-slate-50/60 p-5 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Firmado Por</span>
                <span className="font-bold text-slate-900">{signatureName || profile.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Fecha y Hora</span>
                <span className="font-bold text-slate-800">
                  {new Date(certifiedDate).toLocaleDateString('es-DO', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Estado en Base de Datos</span>
                <span className="font-bold text-emerald-700">✓ Completado</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Printer size={14} />
                <span>Imprimir Constancia</span>
              </button>

              {onBackToHub && (
                <button
                  type="button"
                  onClick={onBackToHub}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Volver al Menú Principal</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
