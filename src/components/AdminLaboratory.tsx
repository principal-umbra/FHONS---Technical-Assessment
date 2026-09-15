import React, { useState, useEffect } from 'react';
import { FlaskConical, BrainCircuit, Loader2, AlertCircle, Edit3, Save, CheckCircle, Sparkles, Database } from 'lucide-react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, listEvaluations, EvaluationDocument } from '../lib/firebase';
import Markdown from 'react-markdown';
import { Questionnaire } from '../types';

interface AdminLaboratoryProps {
  questionnaire: Questionnaire;
}

export default function AdminLaboratory({ questionnaire }: AdminLaboratoryProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [questionnaire.id, questionnaire.collectionPath]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setSelectedUser('');
    setAnalysisResult(null);
    try {
      // Query STRICTLY the active questionnaire collection
      const q = query(collection(db, questionnaire.collectionPath), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const emails = new Set<string>();
      snapshot.forEach(doc => {
        const data = doc.data() as EvaluationDocument;
        if (data.profile?.email) {
          emails.add(data.profile.email);
        }
      });
      setUsers(Array.from(emails));
    } catch (err) {
      console.error("Error loading users for laboratory:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const isPerfil = questionnaire.id === 'perfil_profesional';

  const handleAnalyze = async () => {
    if (!selectedUser) return;
    
    setAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
    setIsEditing(false);
    setSaveSuccess(false);
    
    try {
      // 1. Fetch user evaluations from the specific collection
      const evaluations = await listEvaluations(selectedUser, questionnaire.collectionPath);
      
      if (evaluations.length === 0) {
        throw new Error(`No hay registros para este usuario en ${questionnaire.title}.`);
      }

      // 2. Call the Gemini API backend with questionnaireType
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          evaluations,
          questionnaireType: questionnaire.id 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al procesar con Gemini");
      }
      
      setAnalysisResult(data.analysis);
      
    } catch (err: any) {
      console.error("Error analyzing:", err);
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToLibrero = async () => {
    if (!analysisResult || !selectedUser) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await addDoc(collection(db, 'laboratory_reports'), {
        userEmail: selectedUser,
        questionnaireId: questionnaire.id,
        questionnaireTitle: questionnaire.title,
        collectionPath: questionnaire.collectionPath,
        reportContent: analysisResult,
        createdAt: serverTimestamp(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving to Librero:", err);
      setError("Error al guardar en el librero: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col min-h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {questionnaire.collectionPath}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <FlaskConical size={20} className="text-slate-800" />
              {isPerfil ? 'Laboratorio de Redacción de Biografía Web con IA' : 'Laboratorio de Diagnóstico Conductual con IA'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isPerfil 
              ? 'Genera una biografía web pulida, atractiva y profesional para el portal oficial de FHONS a partir de las respuestas del colaborador.'
              : 'Perfil conductual, psicológico y de habilidades blandas del agente técnico generado con Gemini AI.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {isPerfil ? 'Seleccionar Colaborador para Redactar Ficha' : 'Seleccionar Agente de Soporte TI'}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={loadingUsers || analyzing}
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition font-medium disabled:opacity-50"
          >
            <option value="">-- Selecciona un colaborador ({users.length} disponibles en {questionnaire.title}) --</option>
            {users.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={!selectedUser || analyzing}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shadow-sm"
          >
            {analyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generando con IA...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {isPerfil ? 'Redactar Biografía Web' : 'Generar Diagnóstico IA'}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-xs">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col flex-1">
          <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resultado Generado</span>
              <h3 className="font-bold text-slate-900 text-sm">
                {isPerfil ? 'Borrador Editorial de Ficha Corporativa' : 'Informe Conductual y Psicológico'} • {selectedUser}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 size={14} />
                {isEditing ? 'Vista Previa' : 'Editar Texto'}
              </button>
              <button
                onClick={handleSaveToLibrero}
                disabled={saving}
                className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <CheckCircle size={14} className="text-emerald-400" />
                    ¡Guardado!
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Guardar en Librero
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-50/60 rounded-xl p-6 border border-slate-100 overflow-y-auto max-h-[600px]">
            {isEditing ? (
              <textarea
                value={analysisResult}
                onChange={(e) => setAnalysisResult(e.target.value)}
                className="w-full h-full min-h-[400px] p-4 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            ) : (
              <div className="prose prose-slate max-w-none text-xs leading-relaxed">
                <Markdown>{analysisResult}</Markdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
