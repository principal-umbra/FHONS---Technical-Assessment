/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Section2Answers } from '../../../types';
import { PILLARS } from './data';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InputBadge } from './Section1';

interface Section2Props {
  answers: Section2Answers;
  onChange: (answers: Section2Answers) => void;
}

export default function Section2({ answers, onChange }: Section2Props) {
  const [activePillarId, setActivePillarId] = useState<string>(PILLARS[0].id);

  const activePillar = PILLARS.find((p) => p.id === activePillarId) || PILLARS[0];
  const activeEval = answers.pillars[activePillar.id] || { rating: 5, backlogExample: '', tenOverTenBehavior: '' };

  const handleRatingChange = (rating: number) => {
    const updatedPillars = {
      ...answers.pillars,
      [activePillar.id]: {
        ...activeEval,
        rating
      }
    };
    onChange({ ...answers, pillars: updatedPillars });
  };

  const handleTextChange = (field: 'backlogExample' | 'tenOverTenBehavior', val: string) => {
    const updatedPillars = {
      ...answers.pillars,
      [activePillar.id]: {
        ...activeEval,
        [field]: val
      }
    };
    onChange({ ...answers, pillars: updatedPillars });
  };

  const isPillarCompleted = (id: string) => {
    const pEval = answers.pillars[id];
    return pEval && pEval.backlogExample.trim().length > 5 && pEval.tenOverTenBehavior.trim().length > 5;
  };

  const completedCount = PILLARS.filter((p) => isPillarCompleted(p.id)).length;
  const averageRating = (
    PILLARS.reduce((sum, p) => sum + (answers.pillars[p.id]?.rating || 5), 0) / PILLARS.length
  ).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="section2-container"
    >
      {/* Header Introduction Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-200/60 flex justify-between items-center flex-wrap gap-4" id="section2-intro">
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-1">Diagnóstico de Pilares</span>
          <h3 className="text-2xl font-bold font-display">Sección 2: Los 8 Pilares del Servicio</h3>
          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            Evalúa tu consistencia actual en cada uno de los 8 Pilares Fundamentales de Soporte de Excelencia. Califícate del 1 al 10 y analiza tus brechas frente a un agente sobresaliente.
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-5 py-4 rounded-2xl text-center min-w-[130px]">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold font-mono">Promedio</span>
          <span className="text-3xl font-mono font-bold text-white">{averageRating} / 10</span>
        </div>
      </div>

      {/* Grid Layout splits: list of pillars vs details card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="section2-split-grid">
        
        {/* Left Side: Columns List of Pillars */}
        <div className="lg:col-span-4 space-y-2.5" id="section2-pillars-sidebar">
          <div className="flex justify-between items-center px-2 py-1 flex-wrap gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono block">Pilares ({completedCount}/{PILLARS.length})</span>
              <InputBadge type="single" />
            </div>
            <span className="text-xs font-mono text-slate-900 font-bold">{Math.round((completedCount / PILLARS.length) * 100)}% Listo</span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1" id="pillars-list">
            {PILLARS.map((pillar) => {
              const rating = answers.pillars[pillar.id]?.rating || 5;
              const completed = isPillarCompleted(pillar.id);
              const isActive = pillar.id === activePillarId;

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillarId(pillar.id)}
                  className={`w-full p-4 text-left rounded-2xl border transition duration-150 flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-white border-slate-900 shadow-lg ring-2 ring-slate-900/5'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold font-sans ${isActive ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {pillar.name}
                      </span>
                      {completed && (
                        <CheckCircle size={13} className="text-slate-900 inline-block" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block font-sans">{pillar.subTitle}</span>
                  </div>

                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                    rating >= 8
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : rating >= 5
                      ? 'bg-slate-50 text-slate-700 border border-slate-200/50'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {rating}/10
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Evaluation Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 flex flex-col justify-between" id="section2-pillar-active-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header and description */}
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block">Evaluando Pilar Activo</span>
                <h4 className="text-xl font-bold text-slate-900 font-display">{activePillar.name}</h4>
                <p className="text-slate-500 text-xs italic">"{activePillar.subTitle}"</p>
                <p className="text-slate-600 text-sm bg-slate-50 border border-slate-200/60 p-4 rounded-2xl mt-2 leading-relaxed font-sans">
                  {activePillar.description}
                </p>
              </div>

              {/* 1-10 Rating Scale */}
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    ¿Cómo te calificas en este pilar actualmente?
                  </label>
                  <InputBadge type="single" />
                </div>
                <div className="flex flex-wrap justify-between gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleRatingChange(score)}
                      className={`flex-1 min-w-[32px] h-9 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                        activeEval.rating === score
                          ? 'bg-slate-900 text-white shadow-md transform scale-105'
                          : 'hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 px-1 font-mono">
                  <span>1 - Crítico / Poco consistente</span>
                  <span>5 - Regular / Técnico estándar</span>
                  <span>10 - Sobresaliente / Agente de Excelencia</span>
                </div>
              </div>

              {/* Backlog Example */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label htmlFor="backlog-example" className="text-xs font-semibold text-slate-700 block">
                    Ejemplo práctico de tu backlog de tickets: <span className="text-[10px] text-slate-400 font-normal">(Cuándo aplicaste esto o dónde fallaste)</span>
                  </label>
                  <InputBadge type="text" />
                </div>
                <textarea
                  id="backlog-example"
                  rows={3}
                  value={activeEval.backlogExample}
                  onChange={(e) => handleTextChange('backlogExample', e.target.value)}
                  placeholder={`Ej: 'En el ticket del ERP, me detuve a explicarle la situación al cliente pacientemente...' o 'A veces me cuesta este pilar porque respondo de forma muy mecánica en chats rápidos...'`}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              {/* 10/10 Behavior Reflection */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label htmlFor="10-10-behavior" className="text-xs font-semibold text-slate-700 block">
                    ¿Qué haría un agente 10/10 en este pilar que tú no estás haciendo de forma consistente?
                  </label>
                  <InputBadge type="text" />
                </div>
                <textarea
                  id="10-10-behavior"
                  rows={3}
                  value={activeEval.tenOverTenBehavior}
                  onChange={(e) => handleTextChange('tenOverTenBehavior', e.target.value)}
                  placeholder="Ej: 'Confirmar siempre de forma explícita si el usuario entendió el cambio técnico' o 'Dar seguimiento proactivo al día siguiente antes de cerrar definitivamente...'"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prompt to fill or advance */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400" id="pillar-footer-nav">
            <div>
              {isPillarCompleted(activePillar.id) ? (
                <span className="text-slate-900 font-bold flex items-center gap-1">
                  <CheckCircle size={14} /> Listo para guardar
                </span>
              ) : (
                <span className="italic">Escribe tu ejemplo y reflexión para completar este pilar.</span>
              )}
            </div>
            
            {/* Simple navigation between pillars inside section */}
            <div className="flex gap-2">
              {PILLARS.indexOf(activePillar) < PILLARS.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = PILLARS.indexOf(activePillar) + 1;
                    setActivePillarId(PILLARS[nextIndex].id);
                  }}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 transition font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Siguiente Pilar
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
