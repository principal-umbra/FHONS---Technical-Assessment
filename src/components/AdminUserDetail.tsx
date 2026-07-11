import React, { useState, useEffect } from 'react';
import { db, EvaluationDocument, getQuestionnaires } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Loader2, FileText, CheckCircle, Clock, Trash2, Eye, FileBarChart2, ChevronDown, ChevronRight } from 'lucide-react';
import { Questionnaire } from '../types';

interface AdminUserDetailProps {
  email: string;
  onViewReport: (evalDoc: EvaluationDocument) => void;
  onViewDetail: (evalDoc: EvaluationDocument) => void;
}

interface GroupedEvaluations {
  questionnaire: Questionnaire;
  evaluations: EvaluationDocument[];
  isExpanded: boolean;
}

export default function AdminUserDetail({ email, onViewReport, onViewDetail }: AdminUserDetailProps) {
  const [loading, setLoading] = useState(true);
  const [groupedEvaluations, setGroupedEvaluations] = useState<GroupedEvaluations[]>([]);

  useEffect(() => {
    fetchUserEvaluations();
  }, [email]);

  const fetchUserEvaluations = async () => {
    try {
      const questionnaires = await getQuestionnaires();
      const groups: GroupedEvaluations[] = [];
      
      for (const qDoc of questionnaires) {
        if (!qDoc.collectionPath) continue;
        
        const qRef = query(
          collection(db, qDoc.collectionPath), 
          where('profile.email', '==', email.toLowerCase()),
          orderBy('updatedAt', 'desc')
        );
        
        const snapshot = await getDocs(qRef);
        const data: EvaluationDocument[] = [];
        snapshot.forEach((d) => {
          data.push(d.data() as EvaluationDocument);
        });
        
        if (data.length > 0) {
          groups.push({
            questionnaire: qDoc,
            evaluations: data,
            isExpanded: true // Default expanded
          });
        }
      }
      
      setGroupedEvaluations(groups);
    } catch (err) {
      console.error('Error fetching user evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, collectionPath: string) => {
    if (window.confirm('⚠️ ALERTA DE VERIFICACIÓN\n\n¿Estás seguro de que deseas eliminar permanentemente esta evaluación? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, collectionPath, id));
        // Update state
        setGroupedEvaluations(prev => prev.map(group => {
          if (group.questionnaire.collectionPath === collectionPath) {
            return {
              ...group,
              evaluations: group.evaluations.filter(ev => ev.id !== id)
            };
          }
          return group;
        }).filter(group => group.evaluations.length > 0)); // Remove group if empty
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const toggleGroup = (index: number) => {
    setGroupedEvaluations(prev => prev.map((g, i) => i === index ? { ...g, isExpanded: !g.isExpanded } : g));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Cargando evaluaciones del usuario...</p>
      </div>
    );
  }

  if (groupedEvaluations.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <FileText size={48} className="opacity-20" />
        <p className="text-sm">El usuario no tiene evaluaciones registradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvaluations.map((group, index) => (
        <div key={group.questionnaire.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <div 
            className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
            onClick={() => toggleGroup(index)}
          >
            <div className="flex items-center gap-3">
              {group.isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{group.questionnaire.title}</h2>
                <p className="text-xs text-slate-500">{group.questionnaire.description}</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm">
              {group.evaluations.length} {group.evaluations.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          
          {group.isExpanded && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">ID de Evaluación</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Fecha de Finalización</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {ev.id.substring(0, 8)}...
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
                      <td className="px-6 py-4 text-xs font-mono">
                        {new Date(ev.updatedAt).toLocaleDateString()} {new Date(ev.updatedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => onViewReport(ev)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                          title="Ver Reporte Final"
                        >
                          <FileBarChart2 size={14} /> Reporte
                        </button>
                        <button
                          onClick={() => onViewDetail(ev)}
                          className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                          title="Ver Respuestas Sección por Sección"
                        >
                          <Eye size={14} /> Detalle
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, group.questionnaire.collectionPath)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar Evaluación"
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
      ))}
    </div>
  );
}