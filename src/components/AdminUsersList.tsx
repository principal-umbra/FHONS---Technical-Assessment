import React, { useState, useEffect } from 'react';
import { db, EvaluationDocument, getQuestionnaires } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Loader2, FileText, ChevronRight } from 'lucide-react';
import { Questionnaire } from '../types';

interface AdminUsersListProps {
  onUserSelect: (email: string) => void;
}

export default function AdminUsersList({ onUserSelect }: AdminUsersListProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Array<{ email: string; name: string; count: number; lastEval: string }>>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First fetch all questionnaires to know which collections to query
      const questionnaires = await getQuestionnaires();
      
      const userMap = new Map<string, { email: string; name: string; count: number; lastEval: string }>();
      
      // We will query each questionnaire collection (if we had many this could be slow, but for an MVP it works well)
      // and we aggregate all user evaluations.
      for (const qDoc of questionnaires) {
        if (!qDoc.collectionPath) continue;
        
        const qRef = query(collection(db, qDoc.collectionPath), orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(qRef);
        
        snapshot.forEach((d) => {
          const data = d.data() as EvaluationDocument;
          const email = data.profile.email.toLowerCase();
          if (userMap.has(email)) {
            const u = userMap.get(email)!;
            u.count += 1;
            // Update lastEval if this one is newer
            if (new Date(data.updatedAt) > new Date(u.lastEval)) {
              u.lastEval = data.updatedAt;
            }
          } else {
            userMap.set(email, {
              email,
              name: data.profile.name,
              count: 1,
              lastEval: data.updatedAt
            });
          }
        });
      }
      
      // Sort users by last evaluation time
      const userList = Array.from(userMap.values());
      userList.sort((a, b) => new Date(b.lastEval).getTime() - new Date(a.lastEval).getTime());
      
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Cargando usuarios...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <FileText size={48} className="opacity-20" />
        <p className="text-sm">No hay usuarios registrados con evaluaciones.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-100/50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
          <tr>
            <th className="px-6 py-4 rounded-tl-xl">Usuario</th>
            <th className="px-6 py-4">Evaluaciones Completadas</th>
            <th className="px-6 py-4">Última Actividad</th>
            <th className="px-6 py-4 text-right rounded-tr-xl">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.email} className="hover:bg-white transition cursor-pointer group" onClick={() => onUserSelect(u.email)}>
              <td className="px-6 py-4">
                <div className="font-bold text-slate-800">{u.name}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs">
                  {u.count} {u.count === 1 ? 'evaluación' : 'evaluaciones'}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-mono text-slate-500">
                {new Date(u.lastEval).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Ver Detalles <ChevronRight size={16} className="ml-1" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}