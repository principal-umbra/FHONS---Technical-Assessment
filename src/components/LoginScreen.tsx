import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Shield, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onBack, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const rawPass = password;
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 1. Direct doc lookup by email id
      const credentialDocRef = doc(db, 'credentials', cleanEmail);
      const credentialSnap = await getDoc(credentialDocRef);
      
      let matchedData: any = null;

      if (credentialSnap.exists()) {
        matchedData = credentialSnap.data();
      } else {
        // Fallback: search by email field in credentials collection
        const q = query(collection(db, 'credentials'), where('email', '==', cleanEmail));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          matchedData = querySnap.docs[0].data();
        }
      }

      if (matchedData) {
        if (matchedData.password === rawPass || matchedData.password === cleanPass) {
          onLoginSuccess();
          return;
        } else {
          setError('Contraseña incorrecta. Verifica la contraseña ingresada.');
          setLoading(false);
          return;
        }
      }
      
      setError(`No se encontró un usuario administrador registrado con el correo ${cleanEmail}.`);
      setLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Error al consultar Firestore: ${err?.message || 'Error de conexión o permisos'}`);
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
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-800 transition rounded-full hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col items-center text-center mt-6 space-y-6">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg">
            <Shield size={32} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 font-display">Acceso Administrativo</h2>
            <p className="text-slate-500 text-sm">Inicia sesión con tus credenciales de administrador.</p>
          </div>

          {error && (
            <div className="w-full p-3.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200/80 text-left leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Correo electrónico (ej. rquintana@fhons.com.do)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
