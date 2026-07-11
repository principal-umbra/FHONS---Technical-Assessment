import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Save, Loader2, CheckCircle, Upload } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Settings state
  const [tecnicasImage, setTecnicasImage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'app_settings', 'general');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tecnicas_comunicacion_img) {
          setTecnicasImage(data.tecnicas_comunicacion_img);
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // We use Canvas to compress the image so it fits within Firestore's 1MB limit
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max width 1200px
        const MAX_WIDTH = 1000;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill with white background in case of transparent PNG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setTecnicasImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const docRef = doc(db, 'app_settings', 'general');
      await setDoc(docRef, {
        tecnicas_comunicacion_img: tecnicasImage
      }, { merge: true });
      setMessage({ text: 'Configuraciones guardadas exitosamente.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage({ text: 'Error al guardar las configuraciones (revisa permisos).', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Cargando configuraciones...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={24} className="text-slate-600" />
            Configuraciones de la Plataforma
          </h2>
          <p className="text-sm text-slate-500 mt-1">Administra recursos globales y opciones generales de la app</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar Cambios
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <CheckCircle size={18} />
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm">
          <ImageIcon size={18} className="text-slate-500" />
          Infografía de Técnicas de Comunicación
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Esta imagen se mostrará en el Cuestionario de Servicio al Cliente, en la pregunta sobre "Técnicas Profesionales de Comunicación".
        </p>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
          {tecnicasImage ? (
            <div className="relative w-full flex flex-col items-center">
              <img src={tecnicasImage} alt="Preview" className="max-h-[300px] object-contain rounded-lg shadow-sm border border-slate-200 mb-4" />
              <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                <Upload size={16} /> Cambiar Imagen
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Upload size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">Subir Infografía</p>
              <p className="text-xs text-slate-500 mb-4">JPG, PNG o GIF (se comprimirá automáticamente)</p>
              <label className="cursor-pointer px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition inline-block">
                Seleccionar Archivo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
