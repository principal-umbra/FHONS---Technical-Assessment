/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PerfilProfesionalAnswers } from '../../../types';
import { Heart, Building2, Tag, Compass, Sparkles } from 'lucide-react';

interface SectionPasionCulturaProps {
  answers: PerfilProfesionalAnswers;
  onChange: (updatedAnswers: PerfilProfesionalAnswers) => void;
}

export default function SectionPasionCultura({ answers, onChange }: SectionPasionCulturaProps) {
  const words = answers.tresPalabras || ['', '', ''];

  const handleWordChange = (index: number, val: string) => {
    const updatedWords: [string, string, string] = [
      words[0] || '',
      words[1] || '',
      words[2] || ''
    ];
    updatedWords[index] = val;
    onChange({ ...answers, tresPalabras: updatedWords });
  };

  return (
    <div className="space-y-6" id="section-pasion-cultura">
      {/* Grid: Qué disfrutas más de tu trabajo & Qué es lo que más te gusta de trabajar en FHONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qué disfrutas más de tu trabajo */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Heart size={16} />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">7. ¿Qué disfrutas más de tu trabajo?</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aquello que te motiva día tras día, los retos que te gusta resolver o la satisfacción que obtienes en tus labores.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <textarea
              id="perfil-disfrute-trabajo"
              rows={4}
              placeholder="Ej: Investigar soluciones complejas, ver la tranquilidad del usuario cuando resolvemos una urgencia, el aprendizaje continuo con nuevas tecnologías..."
              value={answers.disfruteTrabajo}
              onChange={(e) => onChange({ ...answers, disfruteTrabajo: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Qué es lo que más te gusta de trabajar en FHONS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 size={16} />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">8. ¿Qué es lo que más te gusta de trabajar en FHONS?</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              La cultura corporativa, el compañerismo, la flexibilidad o el propósito que compartimos en el equipo.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <textarea
              id="perfil-gusto-fhons"
              rows={4}
              placeholder="Ej: El ambiente de colaboración, el apoyo incondicional entre compañeros para sacar cualquier proyecto adelante y la confianza que la dirección deposita en nosotros..."
              value={answers.gustoFhons}
              onChange={(e) => onChange({ ...answers, gustoFhons: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Card: Tres palabras que te describen */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Tag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-850 font-display">9. ¿Cómo te describirías en tres palabras?</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  Obligatoria
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tres palabras o conceptos breves que definan tu esencia, personalidad y enfoque.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="palabra-1" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Palabra 1 *
            </label>
            <input
              id="palabra-1"
              type="text"
              placeholder="Ej. Resiliente"
              value={words[0] || ''}
              onChange={(e) => handleWordChange(0, e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold text-center placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="palabra-2" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Palabra 2 *
            </label>
            <input
              id="palabra-2"
              type="text"
              placeholder="Ej. Curioso"
              value={words[1] || ''}
              onChange={(e) => handleWordChange(1, e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold text-center placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="palabra-3" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Palabra 3 *
            </label>
            <input
              id="palabra-3"
              type="text"
              placeholder="Ej. Colaborativo"
              value={words[2] || ''}
              onChange={(e) => handleWordChange(2, e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold text-center placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Grid: Hobbies y Talento oculto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hobbies o pasatiempos */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Compass size={18} className="text-teal-600" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">10. ¿Qué hobbies o pasatiempos tienes?</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                  Obligatoria
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lo que disfrutas hacer en tu tiempo libre, tus deportes, aficiones o actividades recreativas.
            </p>
          </div>

          <div className="pt-2">
            <textarea
              id="perfil-hobbies"
              rows={3}
              placeholder="Ej: Jugar ajedrez, correr maratones, fotografía de naturaleza, tocar la guitarra, videojuegos o la lectura de ciencia ficción..."
              value={answers.hobbies}
              onChange={(e) => onChange({ ...answers, hobbies: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Talento poco conocido */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Sparkles size={18} className="text-amber-500" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">11. ¿Tienes algún talento que pocos conozcan?</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Esa habilidad secreta, artística, culinaria o curiosa que sorprendería a quienes te conocen solo en el trabajo.
            </p>
          </div>

          <div className="pt-2">
            <textarea
              id="perfil-talento-oculto"
              rows={3}
              placeholder="Ej: Cocino pastas artesanales espectaculares, puedo armar el cubo de Rubik en 40 segundos, pinto en acuarela o canto afinado..."
              value={answers.talentoOculto}
              onChange={(e) => onChange({ ...answers, talentoOculto: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
