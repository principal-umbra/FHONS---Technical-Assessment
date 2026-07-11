import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onBack, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const credentialDocRef = doc(db, 'credentials', email.toLowerCase());
      const credentialSnap = await getDoc(credentialDocRef);
      
      if (credentialSnap.exists()) {
        const data = credentialSnap.data();
        if (data.password === password) {
          onLoginSuccess();
          return;
        }
      }
      
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Error al intentar iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-md mx-auto w-full flex items-center justify-center py-12"
    >
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/80 border border-slate-200/60 w-full relative overflow-hidden">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-800 transition rounded-full hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col items-center text-center mt-6 space-y-6">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg">
            <Shield size={32} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 font-display">Acceso Administrativo</h2>
            <p className="text-slate-500 text-sm">Inicia sesión con tus credenciales.</p>
          </div>

          {error && (
            <div className="w-full p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
