import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Copy, 
  Check, 
  Filter, 
  Headphones, 
  Globe, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  UserPlus,
  BookOpen,
  Award,
  ExternalLink,
  ShieldAlert,
  Moon,
  Inbox,
  Server,
  Briefcase,
  Tag
} from 'lucide-react';
import { 
  QuestionnaireAssignment, 
  Questionnaire 
} from '../types';
import { 
  getAllAssignments, 
  saveAssignment, 
  deleteAssignment, 
  bulkAssignQuestionnaire,
  getQuestionnaires,
  normalizeEmail,
  getCanonicalEmail,
  getAllAssociatedEmails
} from '../lib/firebase';

interface AdminAssignmentsProps {
  questionnaires: Questionnaire[];
  onSelectQuestionnaire?: (q: Questionnaire) => void;
  preselectedQuestionnaireId?: string;
}

interface AgentGroup {
  canonicalEmail: string;
  email: string;
  associatedEmails: string[];
  name: string;
  assignments: QuestionnaireAssignment[];
  totalCount: number;
  pendingCount: number;
  abiertoPendienteCount: number;
  inProgressCount: number;
  completedCount: number;
  lastAssignedAt: string;
}

export default function AdminAssignments({ 
  questionnaires, 
  onSelectQuestionnaire,
  preselectedQuestionnaireId 
}: AdminAssignmentsProps) {
  const [assignments, setAssignments] = useState<QuestionnaireAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Expanded agent email in accordion
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  // Sub-tab filter per agent (default 'all')
  const [agentTabFilter, setAgentTabFilter] = useState<Record<string, 'all' | 'to_do' | 'completed' | 'abierto_pendiente' | 'in_progress' | 'pending'>>({});

  // Quick single-agent assign modal state
  const [quickAssignAgent, setQuickAssignAgent] = useState<AgentGroup | null>(null);
  const [quickSelectedQIds, setQuickSelectedQIds] = useState<string[]>([]);
  const [quickNotes, setQuickNotes] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // Form state for general bulk assign
  const [emailsInput, setEmailsInput] = useState('');
  const [agentNameInput, setAgentNameInput] = useState('');
  const [selectedQuestionnaireIds, setSelectedQuestionnaireIds] = useState<string[]>(
    preselectedQuestionnaireId ? [preselectedQuestionnaireId] : ['servicio_al_cliente']
  );
  const [notesInput, setNotesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuestionnaire, setFilterQuestionnaire] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (preselectedQuestionnaireId) {
      setSelectedQuestionnaireIds([preselectedQuestionnaireId]);
      setFilterQuestionnaire(preselectedQuestionnaireId);
    }
  }, [preselectedQuestionnaireId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await getAllAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  // Group assignments by unique canonical agent identity (Strictly ONE entry per real agent)
  const agentGroups: AgentGroup[] = useMemo(() => {
    // Priority order for status: completed > abierto_pendiente > in_progress > pending
    const statusScore = (st: string) => {
      switch (st) {
        case 'completed': return 4;
        case 'abierto_pendiente': return 3;
        case 'in_progress': return 2;
        default: return 1;
      }
    };

    const groupMap = new Map<string, {
      canonicalEmail: string;
      primaryEmail: string;
      associatedEmails: Set<string>;
      name: string;
      qMap: Map<string, QuestionnaireAssignment>;
      lastAssignedAt: string;
    }>();

    assignments.forEach((a) => {
      const cleanEmail = normalizeEmail(a.agentEmail);
      if (!cleanEmail) return;

      const canonical = getCanonicalEmail(cleanEmail);
      const allAliases = getAllAssociatedEmails(cleanEmail);

      let record = groupMap.get(canonical);
      const agentName = a.agentName && !a.agentName.includes('@') ? a.agentName : '';

      if (!record) {
        record = {
          canonicalEmail: canonical,
          primaryEmail: cleanEmail.endsWith('@fhons.com.do') ? cleanEmail : (canonical || cleanEmail),
          associatedEmails: new Set([cleanEmail, ...allAliases]),
          name: agentName || (cleanEmail === canonical ? cleanEmail.split('@')[0] : 'Raymond Quintana'),
          qMap: new Map<string, QuestionnaireAssignment>(),
          lastAssignedAt: a.assignedAt || ''
        };
        groupMap.set(canonical, record);
      } else {
        record.associatedEmails.add(cleanEmail);
        allAliases.forEach(alt => record!.associatedEmails.add(alt));
        if (cleanEmail.endsWith('@fhons.com.do') && !record.primaryEmail.endsWith('@fhons.com.do')) {
          record.primaryEmail = cleanEmail;
        }
        if (agentName && (!record.name || record.name.includes('@') || record.name === 'Sin nombre')) {
          record.name = agentName;
        }
        if (new Date(a.assignedAt || 0).getTime() > new Date(record.lastAssignedAt || 0).getTime()) {
          record.lastAssignedAt = a.assignedAt || record.lastAssignedAt;
        }
      }

      // Consolidate questionnaire by questionnaireId, keeping the most advanced status
      const existingQ = record.qMap.get(a.questionnaireId);
      if (!existingQ) {
        record.qMap.set(a.questionnaireId, a);
      } else {
        if (statusScore(a.status) > statusScore(existingQ.status)) {
          record.qMap.set(a.questionnaireId, a);
        }
      }
    });

    const result: AgentGroup[] = [];
    groupMap.forEach((entry) => {
      const consolidatedAssignments = Array.from(entry.qMap.values());
      // Sort questionnaires: by category or title
      consolidatedAssignments.sort((q1, q2) => (q1.questionnaireTitle || q1.questionnaireId).localeCompare(q2.questionnaireTitle || q2.questionnaireId));

      const completedCount = consolidatedAssignments.filter(a => a.status === 'completed').length;
      const abiertoPendienteCount = consolidatedAssignments.filter(a => a.status === 'abierto_pendiente').length;
      const inProgressCount = consolidatedAssignments.filter(a => a.status === 'in_progress').length;
      const pendingCount = consolidatedAssignments.filter(a => a.status === 'pending').length;

      result.push({
        canonicalEmail: entry.canonicalEmail,
        email: entry.primaryEmail,
        associatedEmails: Array.from(entry.associatedEmails),
        name: entry.name || entry.primaryEmail.split('@')[0],
        assignments: consolidatedAssignments,
        totalCount: consolidatedAssignments.length,
        pendingCount,
        abiertoPendienteCount,
        inProgressCount,
        completedCount,
        lastAssignedAt: entry.lastAssignedAt
      });
    });

    result.sort((a, b) => new Date(b.lastAssignedAt || 0).getTime() - new Date(a.lastAssignedAt || 0).getTime());
    return result;
  }, [assignments]);

  // Derived metrics from unique consolidated agents
  const uniqueAgents = agentGroups.length;
  const pendingCount = agentGroups.reduce((acc, g) => acc + g.pendingCount, 0);
  const abiertoPendienteCount = agentGroups.reduce((acc, g) => acc + g.abiertoPendienteCount, 0);
  const inProgressCount = agentGroups.reduce((acc, g) => acc + g.inProgressCount, 0);
  const completedCount = agentGroups.reduce((acc, g) => acc + g.completedCount, 0);

  // Filtered Agent Groups
  const filteredAgents = useMemo(() => {
    return agentGroups.filter(agent => {
      // Search matches agent email, any alias, name, or any of their assigned questionnaire titles
      const matchesSearch = 
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.associatedEmails.some(em => em.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agent.assignments.some(a => 
          (a.questionnaireTitle && a.questionnaireTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
          a.questionnaireId.toLowerCase().includes(searchTerm.toLowerCase())
        );

      if (!matchesSearch) return false;

      // Filter by Questionnaire
      if (filterQuestionnaire !== 'all') {
        const hasQ = agent.assignments.some(a => a.questionnaireId === filterQuestionnaire);
        if (!hasQ) return false;
      }

      // Filter by Status
      if (filterStatus !== 'all') {
        if (filterStatus === 'completed' && agent.completedCount === 0) return false;
        if (filterStatus === 'abierto_pendiente' && agent.abiertoPendienteCount === 0) return false;
        if (filterStatus === 'in_progress' && agent.inProgressCount === 0) return false;
        if (filterStatus === 'pending' && agent.pendingCount === 0) return false;
      }

      return true;
    });
  }, [agentGroups, searchTerm, filterQuestionnaire, filterStatus]);

  const toggleAgentExpand = (canonicalEmail: string, forcedTab?: 'all' | 'completed' | 'abierto_pendiente' | 'in_progress' | 'pending') => {
    if (expandedEmail === canonicalEmail && !forcedTab) {
      setExpandedEmail(null);
    } else {
      setExpandedEmail(canonicalEmail);
      if (forcedTab) {
        setAgentTabFilter(prev => ({ ...prev, [canonicalEmail]: forcedTab }));
      }
    }
  };

  const handleUpdateStatus = async (
    assignment: QuestionnaireAssignment, 
    newStatus: 'pending' | 'in_progress' | 'abierto_pendiente' | 'completed'
  ) => {
    try {
      await saveAssignment({
        ...assignment,
        status: newStatus
      });

      const canonical = getCanonicalEmail(assignment.agentEmail);
      setAssignments(prev => prev.map(a => 
        (a.id === assignment.id || (getCanonicalEmail(a.agentEmail) === canonical && a.questionnaireId === assignment.questionnaireId))
          ? { ...a, status: newStatus } 
          : a
      ));
    } catch (err) {
      console.error('Error updating assignment status:', err);
      alert('Error al actualizar el estado de la asignación.');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, agentEmail: string, questionnaireId: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas revocar esta asignación para ${agentEmail}?`)) {
      return;
    }
    try {
      await deleteAssignment(assignmentId, agentEmail, questionnaireId);
      const canonical = getCanonicalEmail(agentEmail);
      setAssignments(prev => prev.filter(a => 
        !(getCanonicalEmail(a.agentEmail) === canonical && a.questionnaireId === questionnaireId)
      ));
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('Error al revocar la asignación.');
    }
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleQuestionnaireSelect = (qId: string) => {
    setSelectedQuestionnaireIds(prev => 
      prev.includes(qId) 
        ? (prev.length > 1 ? prev.filter(id => id !== qId) : prev)
        : [...prev, qId]
    );
  };

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailsInput.trim()) {
      setFeedback({ type: 'error', message: 'Por favor ingresa al menos un correo de agente.' });
      return;
    }
    if (selectedQuestionnaireIds.length === 0) {
      setFeedback({ type: 'error', message: 'Selecciona al menos un cuestionario a asignar.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const emails = emailsInput
      .split(/[\s,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 3 && e.includes('@'));

    if (emails.length === 0) {
      setFeedback({ type: 'error', message: 'No se detectaron correos electrónicos válidos.' });
      setSubmitting(false);
      return;
    }

    try {
      let totalCreated = 0;
      let totalUpdated = 0;

      for (const email of emails) {
        for (const qId of selectedQuestionnaireIds) {
          const targetQ = questionnaires.find(q => q.id === qId);
          const title = targetQ?.title || qId;

          await saveAssignment({
            agentEmail: email,
            agentName: (emails.length === 1 && agentNameInput.trim()) ? agentNameInput.trim() : email.split('@')[0],
            questionnaireId: qId,
            questionnaireTitle: title,
            assignedAt: new Date().toISOString(),
            assignedBy: 'Administrador FHONS',
            status: 'pending',
            notes: notesInput.trim()
          });
          totalCreated++;
        }
      }

      setFeedback({
        type: 'success',
        message: `¡Asignación exitosa! ${totalCreated} asignación(es) registrada(s) para ${emails.length} agente(s).`
      });

      setEmailsInput('');
      setAgentNameInput('');
      setNotesInput('');
      await fetchAssignments();

      setTimeout(() => {
        setShowAssignModal(false);
        setFeedback(null);
      }, 2000);
    } catch (err) {
      console.error('Error assigning questionnaires:', err);
      setFeedback({ type: 'error', message: 'Error al procesar la asignación en la base de datos.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal to assign more questionnaires directly to an agent
  const openQuickAssignModal = (agent: AgentGroup) => {
    setQuickAssignAgent(agent);
    const existingQIds = agent.assignments.map(a => a.questionnaireId);
    const remaining = questionnaires.filter(q => !existingQIds.includes(q.id));
    setQuickSelectedQIds(remaining.length > 0 ? [remaining[0].id] : []);
    setQuickNotes('');
  };

  const handleQuickAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssignAgent || quickSelectedQIds.length === 0) return;

    setQuickSubmitting(true);
    try {
      for (const qId of quickSelectedQIds) {
        const targetQ = questionnaires.find(q => q.id === qId);
        await saveAssignment({
          agentEmail: quickAssignAgent.email,
          agentName: quickAssignAgent.name,
          questionnaireId: qId,
          questionnaireTitle: targetQ?.title || qId,
          assignedAt: new Date().toISOString(),
          assignedBy: 'Administrador FHONS',
          status: 'pending',
          notes: quickNotes.trim()
        });
      }
      await fetchAssignments();
      setQuickAssignAgent(null);
      setExpandedEmail(quickAssignAgent.canonicalEmail);
    } catch (err) {
      console.error('Error in quick assign:', err);
      alert('Error al asignar el cuestionario.');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const getQuestionnaireIcon = (qId: string) => {
    switch (qId) {
      case 'perfil_profesional':
        return <Globe size={18} className="text-emerald-600" />;
      case 'servicio_al_cliente':
        return <Headphones size={18} className="text-blue-600" />;
      case 'proceso_retroalimentacion':
        return <ShieldAlert size={18} className="text-rose-600" />;
      case 'proceso_guardia':
        return <Moon size={18} className="text-indigo-600" />;
      case 'protocolo_tickets':
        return <Inbox size={18} className="text-purple-600" />;
      case 'protocolo_migraciones':
        return <Server size={18} className="text-cyan-600" />;
      case 'protocolo_visitas':
        return <Briefcase size={18} className="text-amber-600" />;
      default:
        return <FileText size={18} className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6" id="admin-assignments-module">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Control de Accesos & Agentes
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white">
            Asignación de Cuestionarios a Agentes
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Cada fila representa a un único agente. Haz clic sobre cualquier colaborador para consultar en detalle sus cuestionarios completados, en progreso, abiertos pendientes o pendientes, o para asignarle nuevos cuestionarios.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Nueva Asignación
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Agentes Únicos</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">{uniqueAgents}</div>
          <span className="text-[10px] text-slate-400">Colaboradores registrados</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Asignaciones</span>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">{assignments.length}</div>
          <span className="text-[10px] text-slate-400">Total en la plataforma</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Pendientes</span>
            <Clock size={16} className="text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-700 font-display">{pendingCount}</div>
          <span className="text-[10px] text-slate-500">Aún no iniciados</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Abiertos Pendientes</span>
            <AlertCircle size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-display">{abiertoPendienteCount}</div>
          <span className="text-[10px] text-amber-700/80">&lt; 95% para reintentar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Completados</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">{completedCount}</div>
          <span className="text-[10px] text-emerald-700/80">Evaluaciones finalizadas</span>
        </div>
      </div>

      {/* Assignment Creation Form (Modal or Inline when empty) */}
      {(showAssignModal || assignments.length === 0) && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-500/30 shadow-md relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Asignar Cuestionario a Uno o Varios Agentes</h3>
                <p className="text-xs text-slate-500">Ingresa los correos institucionales y selecciona los cuestionarios a habilitar.</p>
              </div>
            </div>

            {assignments.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            )}
          </div>

          <form onSubmit={handleBulkAssign} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Correos Electrónicos de los Agentes *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Puedes ingresar uno o varios (separados por coma o salto de línea)
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="ejemplo: agente1@fhons.com.do, agente2@fhons.com.do"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Nombre Completo del Agente (Opcional si es un solo correo)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Raymond Quintana"
                  value={agentNameInput}
                  onChange={(e) => setAgentNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Instrucciones o Notas para el Agente (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Completar lectura y evaluación de guardia"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                Selecciona los Cuestionarios a Asignar *
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {questionnaires.map((q) => {
                  const isSelected = selectedQuestionnaireIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionnaireSelect(q.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
                            {getQuestionnaireIcon(q.id)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{q.title}</h4>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">{q.category || 'General'}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded text-blue-600 border-slate-300 pointer-events-none mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {q.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              {assignments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Guardando Asignaciones...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Confirmar Asignación</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de agente, correo o cuestionario asignado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Questionnaire filter */}
          <select
            value={filterQuestionnaire}
            onChange={(e) => setFilterQuestionnaire(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los Cuestionarios</option>
            {questionnaires.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Con Pendientes</option>
            <option value="abierto_pendiente">⚠️ Con Abiertos Pendientes</option>
            <option value="in_progress">Con En Progreso</option>
            <option value="completed">Con Completados</option>
          </select>
        </div>
      </div>

      {/* AGENTS LIST (Single Row Per Agent) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw size={24} className="animate-spin mx-auto text-slate-500" />
            <p className="text-xs font-medium">Cargando agentes y asignaciones desde Firestore...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users size={36} className="mx-auto text-slate-300" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">No se encontraron agentes</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchTerm || filterQuestionnaire !== 'all' || filterStatus !== 'all'
                  ? 'No hay agentes que coincidan con los filtros aplicados.'
                  : 'Aún no has asignado cuestionarios a ningún agente. Haz clic en "Nueva Asignación" arriba para comenzar.'}
              </p>
            </div>
            {assignments.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-blue-700"
              >
                <Plus size={14} /> Crear Primera Asignación
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-200 font-semibold items-center">
              <div className="col-span-4">Agente Colaborador</div>
              <div className="col-span-2 text-center">Total Asignados</div>
              <div className="col-span-4 text-center">Desglose de Estados</div>
              <div className="col-span-2 text-right">Gestión</div>
            </div>

            {/* Agent Rows */}
            {filteredAgents.map((agent) => {
              const isExpanded = expandedEmail === agent.canonicalEmail;
              const activeFilter = agentTabFilter[agent.canonicalEmail] || 'all';
              const toDoCount = (agent.pendingCount || 0) + (agent.abiertoPendienteCount || 0) + (agent.inProgressCount || 0);

              // Filtered assignments for this specific agent's expanded view
              const visibleAssignments = agent.assignments.filter(a => {
                if (activeFilter === 'all') return true;
                if ((activeFilter as string) === 'to_do') {
                  return a.status === 'pending' || a.status === 'abierto_pendiente' || a.status === 'in_progress';
                }
                return (a.status as string) === activeFilter;
              });

              return (
                <div key={agent.canonicalEmail} className="transition-all">
                  {/* Main Agent Row */}
                  <div 
                    onClick={() => toggleAgentExpand(agent.canonicalEmail)}
                    className={`p-4 sm:p-5 flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start lg:items-center cursor-pointer transition select-none ${
                      isExpanded 
                        ? 'bg-blue-50/40 border-b border-blue-100 shadow-2xs' 
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Column 1: Agent Info */}
                    <div className="lg:col-span-4 flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="truncate">{agent.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyEmail(agent.email, agent.canonicalEmail);
                            }}
                            className="p-1 text-slate-300 hover:text-slate-600 transition rounded"
                            title="Copiar correo corporativo"
                          >
                            {copiedId === agent.canonicalEmail ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">{agent.email}</div>
                        {agent.associatedEmails.length > 1 && (
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200/60">
                              {agent.associatedEmails.length} correos unificados
                            </span>
                            <span className="truncate text-slate-400 text-[9px]">
                              ({agent.associatedEmails.filter(e => e !== agent.email).join(', ')})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Total count badge */}
                    <div className="lg:col-span-2 flex items-center lg:justify-center w-full lg:w-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold font-mono border border-slate-200">
                        <FileText size={13} className="text-indigo-600" />
                        {agent.totalCount} {agent.totalCount === 1 ? 'Cuestionario' : 'Cuestionarios'}
                      </span>
                    </div>

                    {/* Column 3: State Pills (Interactive, click toggles directly into that sub-tab) */}
                    <div className="lg:col-span-4 flex flex-wrap items-center lg:justify-center gap-1.5 w-full">
                      {/* Completados */}
                      {agent.completedCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgentExpand(agent.canonicalEmail, 'completed');
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
                          title="Ver cuestionarios completados"
                        >
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>{agent.completedCount} Completado{agent.completedCount > 1 ? 's' : ''}</span>
                        </button>
                      )}

                      {/* Abiertos Pendientes */}
                      {agent.abiertoPendienteCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgentExpand(agent.canonicalEmail, 'abierto_pendiente');
                          }}
                          className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold font-mono hover:bg-amber-200 transition cursor-pointer flex items-center gap-1 animate-pulse"
                          title="Cuestionarios abiertos pendientes de completar o reintentar"
                        >
                          <AlertCircle size={11} className="text-amber-700" />
                          <span>{agent.abiertoPendienteCount} Abierto{agent.abiertoPendienteCount > 1 ? 's' : ''} Pend.</span>
                        </button>
                      )}

                      {/* En Progreso */}
                      {agent.inProgressCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgentExpand(agent.canonicalEmail, 'in_progress');
                          }}
                          className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold font-mono hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                          title="Ver cuestionarios en progreso"
                        >
                          <Clock size={11} className="text-blue-600" />
                          <span>{agent.inProgressCount} En Progreso</span>
                        </button>
                      )}

                      {/* Pendientes */}
                      {agent.pendingCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgentExpand(agent.canonicalEmail, 'pending');
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold font-mono hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                          title="Ver cuestionarios no iniciados"
                        >
                          <Clock size={11} className="text-slate-500" />
                          <span>{agent.pendingCount} Pendiente{agent.pendingCount > 1 ? 's' : ''}</span>
                        </button>
                      )}

                      {agent.totalCount === 0 && (
                        <span className="text-[10px] text-slate-400 font-mono italic">Sin asignaciones activas</span>
                      )}
                    </div>

                    {/* Column 4: Toggle & Quick Actions */}
                    <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-2 w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickAssignModal(agent);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Asignar otro cuestionario a este agente"
                      >
                        <UserPlus size={13} />
                        <span className="hidden sm:inline">+ Asignar</span>
                      </button>

                      <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                        <span>{isExpanded ? 'Ocultar' : 'Ver Cuestionarios'}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED ACCORDION: Categorized Questionnaires for this Agent */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 border-b border-slate-200 p-4 sm:p-6 space-y-4">
                      {/* Sub-header & Status Tabs Filter */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                            Cuestionarios asignados a {agent.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {agent.email} • Última asignación: {agent.lastAssignedAt ? new Date(agent.lastAssignedAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'all' }))}
                            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              activeFilter === 'all'
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                            }`}
                          >
                            Todos ({agent.totalCount})
                          </button>

                          {toDoCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'to_do' }))}
                              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                                activeFilter === 'to_do'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                              }`}
                            >
                              <Clock size={11} />
                              Por Hacer ({toDoCount})
                            </button>
                          )}

                          {agent.completedCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'completed' }))}
                              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                                activeFilter === 'completed'
                                  ? 'bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <CheckCircle2 size={11} />
                              Completados ({agent.completedCount})
                            </button>
                          )}

                          {agent.abiertoPendienteCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'abierto_pendiente' }))}
                              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                                activeFilter === 'abierto_pendiente'
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                              }`}
                            >
                              <AlertCircle size={11} />
                              Abiertos Pendientes ({agent.abiertoPendienteCount})
                            </button>
                          )}

                          {agent.inProgressCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'in_progress' }))}
                              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                                activeFilter === 'in_progress'
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                              }`}
                            >
                              <Clock size={11} />
                              En Progreso ({agent.inProgressCount})
                            </button>
                          )}

                          {agent.pendingCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'pending' }))}
                              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                                activeFilter === 'pending'
                                  ? 'bg-slate-700 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              <Clock size={11} />
                              Pendientes ({agent.pendingCount})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Questionnaires Grid for this Agent */}
                      {visibleAssignments.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/60">
                          <p className="text-xs">No hay cuestionarios en este estado para este colaborador.</p>
                          <button
                            type="button"
                            onClick={() => setAgentTabFilter(prev => ({ ...prev, [agent.canonicalEmail]: 'all' }))}
                            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                          >
                            Ver todos los cuestionarios
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {visibleAssignments.map((a) => {
                            const matchedQ = questionnaires.find(q => q.id === a.questionnaireId);
                            const isCompleted = a.status === 'completed';
                            const isAbierto = a.status === 'abierto_pendiente';
                            const isInProgress = a.status === 'in_progress';

                            return (
                              <div 
                                key={a.id} 
                                className={`p-4 rounded-2xl border transition bg-white shadow-2xs flex flex-col justify-between space-y-3 ${
                                  isAbierto 
                                    ? 'border-amber-300 ring-1 ring-amber-300/40' 
                                    : isCompleted 
                                      ? 'border-emerald-200' 
                                      : 'border-slate-200'
                                }`}
                              >
                                {/* Header of Questionnaire Card */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2.5">
                                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                                      {getQuestionnaireIcon(a.questionnaireId)}
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                        {a.questionnaireTitle || matchedQ?.title || a.questionnaireId}
                                      </h5>
                                      <span className="text-[10px] text-slate-400 font-mono block">
                                        {matchedQ?.category || 'Cuestionario Operativo'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Status Select inside Card */}
                                  <select
                                    value={a.status}
                                    onChange={(e) => handleUpdateStatus(a, e.target.value as any)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono border cursor-pointer focus:outline-none shrink-0 ${
                                      isCompleted
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : isAbierto
                                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                                          : isInProgress
                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <option value="pending">⏳ Pendiente</option>
                                    <option value="abierto_pendiente">⚠️ Abierto Pendiente</option>
                                    <option value="in_progress">⚙️ En Progreso</option>
                                    <option value="completed">✓ Completado</option>
                                  </select>
                                </div>

                                {/* Information & Notes */}
                                <div className="space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                  {a.scorePercentage !== undefined && (
                                    <div className="flex items-center justify-between font-mono">
                                      <span className="text-slate-400 text-[10px] uppercase">Calificación Obtenida:</span>
                                      <span className={`font-bold ${a.scorePercentage >= 95 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {a.scorePercentage}% {['proceso_retroalimentacion', 'proceso_guardia', 'protocolo_tickets', 'protocolo_migraciones', 'protocolo_visitas'].includes(a.questionnaireId) 
                                          ? (a.scorePercentage >= 95 ? '✓ Aprobado (≥95%)' : '(Requiere superar 95%)') 
                                          : ''}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                                    <span>Fecha asignado:</span>
                                    <span>{a.assignedAt ? new Date(a.assignedAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                                  </div>

                                  {a.notes ? (
                                    <div className="text-slate-600 pt-1 border-t border-slate-200/60 italic text-[10px]">
                                      Nota: {a.notes}
                                    </div>
                                  ) : null}
                                </div>

                                {/* Card Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                  {matchedQ && onSelectQuestionnaire ? (
                                    <button
                                      type="button"
                                      onClick={() => onSelectQuestionnaire(matchedQ)}
                                      className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <ExternalLink size={12} />
                                      <span>Ver Módulo del Cuestionario</span>
                                    </button>
                                  ) : <span />}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAssignment(a.id, a.agentEmail, a.questionnaireId)}
                                    className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Revocar esta asignación"
                                  >
                                    <Trash2 size={12} />
                                    <span>Revocar</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer inside expanded view */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => openQuickAssignModal(agent)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus size={13} />
                          <span>Asignar Otro Cuestionario a {agent.name}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK ASSIGN MODAL FOR A SPECIFIC AGENT */}
      {quickAssignAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Asignar Cuestionario</h3>
                  <p className="text-xs text-slate-500 font-mono">Agente: {quickAssignAgent.name} ({quickAssignAgent.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAssignAgent(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAssignSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                  Selecciona el Cuestionario a Asignar *
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {questionnaires.map((q) => {
                    const isAlreadyAssigned = quickAssignAgent.assignments.some(a => a.questionnaireId === q.id);
                    const isSelected = quickSelectedQIds.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          if (isAlreadyAssigned) return;
                          setQuickSelectedQIds(prev => 
                            prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
                          );
                        }}
                        className={`p-3 rounded-xl border transition flex items-center justify-between ${
                          isAlreadyAssigned
                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'bg-blue-50/50 border-blue-600 cursor-pointer shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getQuestionnaireIcon(q.id)}
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{q.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{q.category || 'General'}</span>
                          </div>
                        </div>

                        {isAlreadyAssigned ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            ✓ Ya asignado
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded text-blue-600 pointer-events-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Instrucciones o Notas para este Cuestionario (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lectura y certificación obligatoria antes de guardia"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickAssignAgent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={quickSubmitting || quickSelectedQIds.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {quickSubmitting ? 'Asignando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
