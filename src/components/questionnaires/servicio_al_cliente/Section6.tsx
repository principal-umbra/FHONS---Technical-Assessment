/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Section6Answers } from '../../../types';
import { ListTodo, Award, Landmark, Sparkles, PenTool } from 'lucide-react';
import { motion } from 'motion/react';
import { InputBadge } from './Section1';

interface Section6Props {
  answers: Section6Answers;
  onChange: (answers: Section6Answers) => void;
}

export default function Section6({ answers, onChange }: Section6Props) {
  const handleTextChange = (field: keyof Section6Answers, val: any) => {
    onChange({ ...answers, [field]: val });
  };

  const toggleChecklistItem = (itemId: string) => {
    const current = answers.checklist || [];
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    onChange({ ...answers, checklist: updated });
  };

  const checklistOptions = [
    { id: 'tech_verif', label: '¿He verificado minuciosamente la resolución técnica completa?' },
    { id: 'user_conf', label: '¿Confirmé de forma explícita y directa que el usuario se siente satisfecho y operativo?' },
    { id: 'crm_log', label: '¿He documentado de forma clara el diagnóstico y la solución final en el CRM/Tícket?' },
    { id: 'prevention', label: '¿Ofrecí pautas proactivas o consejos adicionales para prevenir que ocurra el mismo error?' },
    { id: 'empathy_close', label: '¿Cerré la interacción con cordialidad, empatía y agradeciendo la confianza brindada?' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
      id="section6-container"
    >
      {/* Introduction banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-200/60" id="section6-intro">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-2">Cierre Informativo</span>
        <h3 className="text-2xl font-bold font-display flex items-center gap-2">
          Sección 6: Cierre y Compromiso Personal
        </h3>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed font-sans">
          Llegamos al módulo final. No hay respuestas incorrectas. Aquí consolidamos tu filosofía diaria de servicio y formalizamos tus compromisos concretos para pasar de ser un agente que "atiende" a uno que verdaderamente "sirve".
        </p>
      </div>

      {/* Question 13: Closing Checklist */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q13-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <ListTodo size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                13. Tu Checklist Personal antes del Cierre Real
              </h4>
              <InputBadge type="multiple" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              ¿Qué preguntas te haces de manera real o intuitiva antes de marcar un ticket como resuelto para garantizar la tranquilidad de tu cliente?
            </p>
          </div>
        </div>

        {/* Checklist selection */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl" id="q13-checklist-selection">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Selecciona los compromisos que te aseguras de cumplir antes de dar por terminado un ticket:
            </span>
          </div>
          <div className="space-y-3">
            {checklistOptions.map((opt) => {
              const checked = answers.checklist?.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-4 bg-white rounded-xl border text-xs cursor-pointer select-none transition ${
                    checked
                      ? 'shadow-xs border-slate-400 bg-slate-100 text-slate-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(opt.id)}
                    className="mt-0.5 rounded text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-950"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question 14: Slider 1 to 10 philosophical rating */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q14-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 font-display">
              14. Reflexión Filosófica de Servicio
            </h4>
            <blockquote className="border-l-4 border-slate-900 pl-4 py-2 bg-slate-50 text-slate-700 text-sm font-sans italic my-2 leading-relaxed">
              “Ser un buen agente técnico no es solo resolver problemas, es hacer que el cliente se sientan comprendido, informado y acompañado.”
            </blockquote>
          </div>
        </div>

        {/* Rating scale slider */}
        <div className="space-y-4" id="q14-scale-slider">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-600">¿Qué tan cerca te sientes de esta frase hoy en día?</span>
            <div className="flex gap-2 items-center">
              <span className="text-base font-mono font-bold text-slate-900">{answers.philosophicalRating} / 10</span>
              <InputBadge type="slider" />
            </div>
          </div>

          <div className="space-y-2 px-1">
            <input
              type="range"
              min="1"
              max="10"
              value={answers.philosophicalRating}
              onChange={(e) => handleTextChange('philosophicalRating', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>1 - Muy alejado</span>
              <span>5 - Regular / Intermedio</span>
              <span>10 - Plenamente comprometido</span>
            </div>
          </div>
        </div>

        {/* Two weeks changes */}
        <div className="space-y-2 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="two-weeks-change" className="text-xs font-semibold text-slate-700 block">
              ¿Qué UNA sola cosa concreta y medible cambiarás en tus próximas 2 semanas de trabajo para subir un punto?
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="two-weeks-change"
            rows={3}
            value={answers.twoWeeksChange}
            onChange={(e) => handleTextChange('twoWeeksChange', e.target.value)}
            placeholder="Ej: 'Me comprometo a llamar por teléfono a cada usuario con tickets críticos de ERP dos veces al día para reportar avance técnico...'"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
          />
        </div>
      </div>

      {/* Question 15: Public / Private commitment & Digital Signature */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q15-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Landmark size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                15. Tu Compromiso de Servicio Personal
              </h4>
              <InputBadge type="single" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Define tu promesa y formalízala con tu firma digital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="q15-fields">
          
          {/* Commitment Text Area */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <label htmlFor="commitment-text" className="text-xs font-semibold text-slate-700 block">
                  Redacta tu compromiso de servicio personal (público o privado): <span className="text-red-500">*</span>
                </label>
                <InputBadge type="text" />
              </div>
              <textarea
                id="commitment-text"
                rows={5}
                value={answers.commitmentText}
                onChange={(e) => handleTextChange('commitmentText', e.target.value)}
                placeholder="Escribe tu compromiso sincero para guiar tus interacciones como una filosofía de trabajo... (Requerido)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
                required
              />
            </div>
          </div>

          {/* Signature widget */}
          <div className="md:col-span-4 space-y-4 flex flex-col justify-between" id="signature-widget">
            <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl flex-1 flex flex-col justify-between min-h-[160px]">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block flex items-center gap-1 font-mono">
                  <PenTool size={11} />
                  Firma Digital Requerida <span className="text-red-500">*</span>
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5 font-sans">Escribe tu nombre para sellar formalmente este cuestionario reflexivo.</span>
              </div>

              {/* Signature display cursive */}
              <div className="border-b border-dashed border-slate-300 py-3 text-center my-3 min-h-[50px] flex items-center justify-center">
                {answers.signature.trim() ? (
                  <span className="text-xl text-slate-900 font-serif italic tracking-wider">
                    {answers.signature}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 italic font-mono">Sin Firmar</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-end">
                  <InputBadge type="text" />
                </div>
                <input
                  type="text"
                  value={answers.signature}
                  onChange={(e) => handleTextChange('signature', e.target.value)}
                  placeholder="Escribe tu nombre completo"
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-750 placeholder-slate-400 focus:outline-none text-center transition font-mono"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
