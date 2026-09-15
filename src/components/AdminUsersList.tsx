import React, { useState, useEffect } from 'react';
import { getUsersByQuestionnaire } from '../lib/firebase';
import { Loader2, FileText, ChevronRight, Search, CheckCircle2, Clock, Users } from 'lucide-react';
import { Questionnaire } from '../types';

interface AdminUsersListProps {
  questionnaire: Questionnaire;
  onUserSelect: (email: string) => void;
}

export default function AdminUsersList({ questionnaire, onUserSelect }: AdminUsersListProps) {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Array<{
    email: string;
    name: string;
    count: number;
    completedCount: number;
    inProgressCount: number;
    lastEval: string;
    lastStatus: 'in_progress' | 'completed';
  }>>([]);

  useEffect(() => {
    fetchUsers();
  }, [questionnaire.id, questionnaire.collectionPath]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Query ONLY the collection path of this specific questionnaire
      const userList = await getUsersByQuestionnaire(questionnaire.collectionPath);
      setUsers(userList);
    } catch (err) {
      console.error(`Error fetching users for ${questionnaire.collectionPath}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const isPerfil = questionnaire.id === 'perfil_profesional';

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin text-slate-600" />
        <p className="text-sm font-medium">Cargando registros de {questionnaire.title}...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header controls inside list */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isPerfil ? "Buscar colaborador por nombre o correo corporativo..." : "Buscar agente por nombre o email..."}
            className="w-full pl-9 pr-4 py-2 bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-2">
          <Users size={15} className="text-slate-500" />
          <span>{filteredUsers.length} {filteredUsers.length === 1 ? (isPerfil ? 'Colaborador' : 'Usuario') : (isPerfil ? 'Colaboradores' : 'Usuarios')}</span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3 bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText size={44} className="opacity-20" />
          <p className="text-sm font-medium text-slate-500">
            {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : `No hay registros en el formulario ${questionnaire.title}.`}
          </p>
          <p className="text-xs text-slate-400">
            Colección activa en BD: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{questionnaire.collectionPath}</code>
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">{isPerfil ? 'Colaborador' : 'Usuario / Agente'}</th>
                <th className="px-6 py-3.5">{isPerfil ? 'Estado Ficha' : 'Intentos / Evaluaciones'}</th>
                <th className="px-6 py-3.5">Última Actualización</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.email} 
                  className="hover:bg-slate-50/80 transition cursor-pointer group" 
                  onClick={() => onUserSelect(u.email)}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-slate-800 transition">{u.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.completedCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2.5 py-1 rounded-full text-xs">
                          <CheckCircle2 size={13} />
                          {isPerfil ? 'Ficha Completa' : `${u.completedCount} Completada${u.completedCount > 1 ? 's' : ''}`}
                        </span>
                      ) : null}
                      {u.inProgressCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold px-2.5 py-1 rounded-full text-xs">
                          <Clock size={13} />
                          {isPerfil ? 'Borrador en Progreso' : `${u.inProgressCount} En Progreso`}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {new Date(u.lastEval).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center text-slate-700 font-bold text-xs group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all">
                      <span>Ver Respuestas</span>
                      <ChevronRight size={16} className="ml-1" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}