import React, { useState, useEffect } from 'react';
import { db, EvaluationDocument, getQuestionnaires } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Loader2, FileText, CheckCircle, Clock, Trash2, Eye, FileBarChart2, ChevronDown, ChevronRight } from 'lucide-react';
import { Questionnaire } from '../types';

interface AdminUserDetailProps {
  email: string;
  questionnaire: Questionnaire;
  onViewReport: (evalDoc: EvaluationDocument) => void;
  onViewDetail: (evalDoc: EvaluationDocument) => void;
}

export default function AdminUserDetail({ email, questionnaire, onViewReport, onViewDetail }: AdminUserDetailProps) {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<EvaluationDocument[]>([]);

  useEffect(() => {
    fetchUserEvaluations();
  }, [email, questionnaire.collectionPath]);

  const fetchUserEvaluations = async () => {
    setLoading(true);
    try {
      // Query STRICTLY the collection for the active questionnaire
      const qRef = query(
        collection(db, questionnaire.collectionPath), 
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(qRef);
      const data: EvaluationDocument[] = [];
      snapshot.forEach((d) => {
        const evalItem = d.data() as EvaluationDocument;
        if (evalItem.profile?.email && evalItem.profile.email.trim().toLowerCase() === email.trim().toLowerCase()) {
          data.push(evalItem);
        }
      });
      
      setEvaluations(data);
    } catch (err) {
      console.error('Error fetching user evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('⚠️ ALERTA DE VERIFICACIÓN\n\n¿Estás seguro de que deseas eliminar permanentemente este registro? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, questionnaire.collectionPath, id));
        setEvaluations(prev => prev.filter(ev => ev.id !== id));
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const isPerfil = questionnaire.id === 'perfil_profesional';

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin text-slate-600" />
        <p className="text-sm font-medium">Cargando evaluaciones de {email}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {questionnaire.collectionPath}
              </span>
              <h2 className="font-bold text-slate-900 text-lg font-display">{questionnaire.title}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{questionnaire.description}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-sm">
            {evaluations.length} {evaluations.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        
        {evaluations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText size={40} className="mx-auto opacity-20" />
            <p className="text-sm font-medium text-slate-600">Este usuario no tiene respuestas registradas en {questionnaire.title}.</p>
            <p className="text-xs text-slate-400">Sus datos en otros formularios permanecen aislados en sus respectivas colecciones.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">ID de Registro</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Última Actualización</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 font-semibold">
                      {ev.id.substring(0, 10)}...
                    </td>
                    <td className="px-6 py-4">
                      {ev.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          <CheckCircle size={12} />
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          <Clock size={12} />
                          En Progreso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {new Date(ev.updatedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onViewReport(ev)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                        title={isPerfil ? "Ver Ficha Web Oficial" : "Ver Reporte Final"}
                      >
                        <FileBarChart2 size={14} /> {isPerfil ? 'Ficha Web' : 'Reporte'}
                      </button>
                      <button
                        onClick={() => onViewDetail(ev)}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                        title="Ver Respuestas Sección por Sección"
                      >
                        <Eye size={14} /> Respuestas
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Eliminar Registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}