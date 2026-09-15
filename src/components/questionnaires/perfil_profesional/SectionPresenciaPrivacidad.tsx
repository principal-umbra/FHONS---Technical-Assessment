/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { PerfilProfesionalAnswers } from '../../../types';
import { 
  Smile, 
  MessageSquare, 
  Quote, 
  Linkedin, 
  Camera, 
  Lock, 
  Upload, 
  X, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

interface SectionPresenciaPrivacidadProps {
  answers: PerfilProfesionalAnswers;
  onChange: (updatedAnswers: PerfilProfesionalAnswers) => void;
}

export default function SectionPresenciaPrivacidad({ answers, onChange }: SectionPresenciaPrivacidadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen no debe superar los 3MB.');
      return;
    }

    // If file is provided, resize/compress with canvas so it never exceeds Firestore document limits (~1MB limit per doc)
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Target max dimension: 800px (ideal for web profile avatars and clean crisp display)
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          onChange({
            ...answers,
            fotoPreferencia: 'tengo_foto',
            fotoUrl: compressedBase64
          });
        } else {
          onChange({
            ...answers,
            fotoPreferencia: 'tengo_foto',
            fotoUrl: src
          });
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6" id="section-presencia-privacidad">
      {/* Grid: Anécdota divertida y Tema para hablar durante horas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Costumbre graciosa o anécdota */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Smile size={18} className="text-amber-500" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">12. Anécdota o costumbre divertida</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              ¿Qué costumbre graciosa o anécdota divertida te gustaría compartir para humanizar tu perfil en la web?
            </p>
          </div>

          <div className="pt-2">
            <textarea
              id="perfil-anecdota"
              rows={3}
              placeholder="Ej: No puedo empezar a programar sin ordenar mis cables por color, o la vez que saludé efusivamente a un cliente pensando que era mi primo..."
              value={answers.anecdotaDivertida}
              onChange={(e) => onChange({ ...answers, anecdotaDivertida: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* De qué tema podrías hablar durante horas */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <MessageSquare size={18} className="text-blue-500" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">13. Tema para hablar durante horas</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              ¿De qué tema podrías hablar durante horas sin aburrirte? Tu pasión o fascinación temática.
            </p>
          </div>

          <div className="pt-2">
            <textarea
              id="perfil-tema-horas"
              rows={3}
              placeholder="Ej: Inteligencia Artificial y el futuro del trabajo, la historia de la aviación, ciberseguridad, fútbol internacional o la evolución del café de especialidad..."
              value={answers.temaHoras}
              onChange={(e) => onChange({ ...answers, temaHoras: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Grid: Frase o Lema que te representa & Algo más sobre ti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frase o lema */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Quote size={18} className="text-indigo-500" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">14. Frase o lema que te representa</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Una cita célebre, mantra o lema personal que guíe tu actitud en la vida o el trabajo.
            </p>
          </div>

          <div className="pt-2">
            <input
              id="perfil-frase-lema"
              type="text"
              placeholder="Ej: 'La excelencia no es un acto, es un hábito' o 'Ningún problema se resiste al trabajo en equipo'"
              value={answers.fraseLema}
              onChange={(e) => onChange({ ...answers, fraseLema: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 italic placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Algo más sobre ti */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <HelpCircle size={18} className="text-slate-500" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">15. ¿Algo más que te gustaría contar?</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cualquier otro detalle, aspiración o mensaje que quieras sumar a tu perfil.
            </p>
          </div>

          <div className="pt-2">
            <textarea
              id="perfil-algo-mas"
              rows={2}
              placeholder="Espacio libre para cualquier pensamiento adicional..."
              value={answers.algoMas}
              onChange={(e) => onChange({ ...answers, algoMas: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Card: LinkedIn & Fotografía de Perfil */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Camera size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-850 font-display">Presencia Web: LinkedIn y Fotografía</h3>
            <p className="text-xs text-slate-500">
              Configura tu enlace profesional y selecciona cómo prefieres gestionar tu fotografía oficial en el portal.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* LinkedIn input (16) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="perfil-linkedin" className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                <Linkedin size={14} className="text-[#0A66C2]" />
                16. Enlace a tu perfil de LinkedIn
              </label>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                Opcional
              </span>
            </div>
            <input
              id="perfil-linkedin"
              type="url"
              placeholder="https://www.linkedin.com/in/tu-nombre-perfil"
              value={answers.linkedinUrl}
              onChange={(e) => onChange({ ...answers, linkedinUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition font-mono"
            />
          </div>

          {/* Fotografía preference radio cards (17) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono block">
                17. ¿Tienes una foto para tu perfil o prefieres que coordinemos una?
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                Obligatoria
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Tengo foto */}
              <div
                onClick={() => onChange({ ...answers, fotoPreferencia: 'tengo_foto' })}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  answers.fotoPreferencia === 'tengo_foto'
                    ? 'border-slate-900 bg-slate-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Camera size={16} />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 font-display">Ya tengo una fotografía lista</h5>
                  </div>
                  {answers.fotoPreferencia === 'tengo_foto' && (
                    <CheckCircle2 size={18} className="text-slate-900" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cuentas con un retrato profesional digital que deseas subir o adjuntar ahora mismo.
                </p>
              </div>

              {/* Option 2: Coordinar sesión */}
              <div
                onClick={() => onChange({ ...answers, fotoPreferencia: 'coordinar_sesion', fotoUrl: '' })}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  answers.fotoPreferencia === 'coordinar_sesion'
                    ? 'border-slate-900 bg-slate-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Smile size={16} />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 font-display">Prefiero coordinar una toma</h5>
                  </div>
                  {answers.fotoPreferencia === 'coordinar_sesion' && (
                    <CheckCircle2 size={18} className="text-slate-900" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  El equipo de FHONS coordinará una sesión institucional para tomar tu fotografía oficial.
                </p>
              </div>
            </div>

            {/* Photo upload area if 'tengo_foto' is selected */}
            {answers.fotoPreferencia === 'tengo_foto' && (
              <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {answers.fotoUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={answers.fotoUrl}
                      alt="Foto de perfil seleccionada"
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 shadow-xs"
                    />
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">Fotografía cargada correctamente</span>
                      <p className="text-[11px] text-slate-500">Se usará en la previsualización de tu ficha oficial.</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Cambiar imagen
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ ...answers, fotoUrl: '' })}
                          className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer transition bg-white"
                  >
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Haz clic para subir tu foto de perfil (JPG, PNG)
                    </span>
                    <span className="text-[11px] text-slate-400">Tamaño máximo recomendado: 3MB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card: 18. Preferencias de Privacidad y Contenido No Publicable */}
      <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-6 md:p-8 shadow-xl shadow-amber-200/30 space-y-4">
        <div className="flex items-center gap-3 border-b border-amber-200/60 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-950 font-display">18. Control de Privacidad y Confidencialidad</h3>
              <span className="px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-900 text-[9px] font-mono font-bold uppercase tracking-wider border border-amber-300">
                Opcional
              </span>
            </div>
            <p className="text-xs text-amber-800">
              ¿Hay alguna respuesta que prefieras que NO publiquemos en la web abierta?
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="perfil-privacidad" className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono">
            Respuestas o detalles reservados estrictamente para uso interno de FHONS
          </label>
          <textarea
            id="perfil-privacidad"
            rows={3}
            placeholder="Si deseas que alguna de las respuestas anteriores (o algún dato específico como fechas, anécdotas o hobbies) sea solo conocida por el equipo interno de RRHH y no aparezca en el sitio web público, indícalo aquí con total confianza..."
            value={answers.restriccionesPrivacidad}
            onChange={(e) => onChange({ ...answers, restriccionesPrivacidad: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition resize-none leading-relaxed"
          />
          <div className="flex items-center gap-2 text-[11px] text-amber-800 font-medium">
            <Lock size={13} className="shrink-0" />
            <span>
              El equipo de administración y marketing filtrará cualquier dato indicado aquí antes de subir tu ficha al website oficial.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
