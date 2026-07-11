/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Section3Answers } from '../../../types';
import { PROCESS_STAGES } from './data';
import { Brain, Settings2, ShieldCheck, Activity, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { InputBadge } from './Section1';

interface Section3Props {
  answers: Section3Answers;
  onChange: (answers: Section3Answers) => void;
}

export default function Section3({ answers, onChange }: Section3Props) {
  const handleTextChange = (field: keyof Section3Answers, val: any) => {
    onChange({ ...answers, [field]: val });
  };

  const handleStageScore = (stageId: string, score: 'strong' | 'neutral' | 'weak') => {
    const updatedScores = { ...answers.processScores, [stageId]: score };
    onChange({ ...answers, processScores: updatedScores });
  };

  const handleStageContribution = (stageId: string, text: string) => {
    const updatedContributions = { ...answers.processContribution, [stageId]: text };
    onChange({ ...answers, processContribution: updatedContributions });
  };

  const toggleChequeoItem = (item: string) => {
    const current = answers.chequeoItems || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    onChange({ ...answers, chequeoItems: updated });
  };

  const checklistItems = [
    { id: 'need', label: '¿Qué necesita realmente el cliente a nivel de su negocio o emoción?' },
    { id: 'info', label: '¿Qué información técnica o funcional me falta antes de emitir un juicio?' },
    { id: 'scope', label: '¿Qué puedo resolver inmediatamente en mi nivel y qué requiere escalación limpia?' },
    { id: 'feeling', label: '¿Cómo quiero que se sienta el usuario al leer/escuchar mi respuesta final?' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
      id="section3-container"
    >
      {/* Intro Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-200/60" id="section3-intro">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-2">Mentalidad Operativa</span>
        <h3 className="text-2xl font-bold font-display">Sección 3: Mentalidad y Proceso (Cómo piensas y actúas)</h3>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
          La excelencia no es un acto aislado, sino un hábito de pensamiento y proceso. Evaluemos tus rutinas mentales, tu alineación con el ciclo de Troubleshooting y tu colaboración ante descuidos comunes del equipo.
        </p>
      </div>

      {/* Question 4: Mental Checklist */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q4-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Brain size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                4. Chequeo Mental Previo vs. Respuesta Reactiva
              </h4>
              <InputBadge type="single" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              ¿Sigues algún ritual o análisis reflexivo interno antes de dar respuesta a un ticket o llamada, o respondes velozmente de manera instintiva?
            </p>
          </div>
        </div>

        {/* Binary Card Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="q4-selector">
          <button
            type="button"
            onClick={() => handleTextChange('chequeoType', 'proactive')}
            className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
              answers.chequeoType === 'proactive'
                ? 'bg-white border-slate-900 ring-2 ring-slate-900/5 shadow-md'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex gap-3">
              <span className={`p-1.5 h-6 w-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${answers.chequeoType === 'proactive' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>A</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 block">Chequeo Mental Proactivo</span>
                <p className="text-slate-500 text-xs mt-1">Hago una pausa consciente para estructurar mi respuesta considerando la situación del cliente.</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTextChange('chequeoType', 'reactive')}
            className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
              answers.chequeoType === 'reactive'
                ? 'bg-white border-slate-900 ring-2 ring-slate-900/5 shadow-md'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex gap-3">
              <span className={`p-1.5 h-6 w-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${answers.chequeoType === 'reactive' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>B</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 block">Respuesta Reactiva Directa</span>
                <p className="text-slate-500 text-xs mt-1">La carga de tickets me empuja a responder lo más rápido técnicamente posible sin mayor preámbulo.</p>
              </div>
            </div>
          </button>
        </div>

        {/* If Proactive, show items checklist */}
        {answers.chequeoType === 'proactive' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl"
            id="q4-checklist-area"
          >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-slate-900" />
                ¿Cuáles de las siguientes preguntas integras en tu checklist mental habitualmente?
              </span>
              <InputBadge type="multiple" />
            </div>
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl text-xs cursor-pointer select-none transition ${
                    answers.chequeoItems?.includes(item.id)
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 border border-transparent hover:bg-white/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={answers.chequeoItems?.includes(item.id)}
                    onChange={() => toggleChequeoItem(item.id)}
                    className="mt-0.5 rounded text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-950"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Describe thoughts */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="q4-reason" className="text-xs font-semibold text-slate-700 block">
              Elabora sobre tu elección: ¿Cómo te ayuda tu chequeo previo o por qué la presión técnica te empuja a ser reactivo?
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="q4-reason"
            rows={3}
            value={answers.chequeoReason}
            onChange={(e) => handleTextChange('chequeoReason', e.target.value)}
            placeholder="Describe con sinceridad tu situación del día a día..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
          />
        </div>
      </div>

      {/* Question 5: Troubleshooting Map */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-8" id="q5-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Activity size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                5. Tu Ciclo de Proceso de Tickets
              </h4>
              <div className="flex gap-2">
                <InputBadge type="single" />
                <InputBadge type="text" />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Califica tu desempeño y explica brevemente cómo aportas valor o cuáles son tus cuellos de botella en cada una de las 5 etapas del ciclo técnico de Soporte de Excelencia.
            </p>
          </div>
        </div>

        {/* Visual Process Flow Map */}
        <div className="space-y-6" id="q5-stages-evaluation">
          {PROCESS_STAGES.map((stage, idx) => {
            const currentScore = answers.processScores[stage.id] || 'neutral';
            const currentText = answers.processContribution[stage.id] || '';

            return (
              <div key={stage.id} className="border-l-2 border-slate-200 pl-6 relative space-y-4" id={`stage-${stage.id}`}>
                {/* Visual Connector Dot */}
                <span className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>

                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-800">{stage.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block font-semibold uppercase tracking-wider">{stage.technicalTerm}</span>
                    <p className="text-slate-500 text-xs mt-0.5 max-w-xl leading-relaxed">{stage.description}</p>
                  </div>

                  {/* 3 State Badge Selector */}
                  <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleStageScore(stage.id, 'strong')}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                        currentScore === 'strong' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Fortaleza
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageScore(stage.id, 'neutral')}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                        currentScore === 'neutral' ? 'bg-slate-400 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Aceptable
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageScore(stage.id, 'weak')}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                        currentScore === 'weak' ? 'bg-red-200 text-red-900 border border-red-300 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Mejora
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="¿Cómo ejecutas esta etapa y qué se te dificulta? (ej. 'Excelente diagnóstico' o 'Fallo en registrar la solución final')"
                  value={currentText}
                  onChange={(e) => handleStageContribution(stage.id, e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition font-sans"
                />
              </div>
            );
          })}
        </div>

        {/* Global Blind Spots */}
        <div className="space-y-2 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="q5-blindspots" className="text-xs font-semibold text-slate-700 block">
              ¿Cuáles identificas como tus puntos ciegos habituales? <span className="text-[10px] text-slate-400 font-normal">(ej. Trazabilidad de tickets, follow-up tardío, etc.)</span>
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="q5-blindspots"
            rows={3}
            value={answers.blindSpots}
            onChange={(e) => handleTextChange('blindSpots', e.target.value)}
            placeholder="Sé muy sincero contigo mismo sobre los procesos administrativos o de seguimiento técnico que sueles omitir..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
          />
        </div>
      </div>

      {/* Question 6: Scenario team follow-up */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q6-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Users size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                6. Escenario de Equipo: La Escalación Vacía
              </h4>
              <InputBadge type="slider" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Un compañero tuyo cierra un ticket interno diciendo simplemente: <span className="italic font-medium text-slate-700">“Ya escalé el caso”</span> sin mayor contexto, detalles técnicos ni seguimiento. El cliente vuelve frustrado e indeciso.
            </p>
          </div>
        </div>

        {/* Slider impact meters */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
            Evaluación de Gravedad del Impacto Negativo:
          </span>
          <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100">
            <strong>Instrucción:</strong> En las barras de abajo, califica del 1 al 5 qué tan grave crees que es el impacto de dejar un caso sin detalles ("escalación vacía").
            <br/><br/>
            - <strong>Impacto en Percepción del Cliente:</strong> ¿Qué tanto afecta su confianza y satisfacción (1 = nada, 5 = mucho)?<br/>
            - <strong>Impacto en Desgaste del Equipo:</strong> ¿Qué tanto afecta el tiempo y esfuerzo de tus compañeros que reciben el caso (1 = nada, 5 = mucho)?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 p-5 rounded-2xl" id="q6-impact-meters">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700">Impacto en Percepción del Cliente</span>
              <span className="text-xs font-mono font-bold text-slate-900">Nivel {answers.scenarioImpactCustomer} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={answers.scenarioImpactCustomer}
              onChange={(e) => handleTextChange('scenarioImpactCustomer', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Mínimo</span>
              <span>Alto Descontento / Abandono</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-700">Impacto en Desgaste del Equipo</span>
              <span className="text-xs font-mono font-bold text-slate-900">Nivel {answers.scenarioImpactTeam} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={answers.scenarioImpactTeam}
              onChange={(e) => handleTextChange('scenarioImpactTeam', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Mínimo</span>
              <span>Re-trabajo Crítico / Mal Entendido</span>
            </div>
          </div>
        </div>

        {/* Written Response Intervention */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="q6-intervention" className="text-xs font-semibold text-slate-700 block">
              ¿Cómo intervendrías tú con ese compañero para elevar el estándar de trazabilidad sin sonar hostil?
            </label>
            <InputBadge type="text" />
          </div>
          <span className="text-[10px] text-slate-400 block -mt-1 mb-2">
            Tip: Aplica Habilidades Blandas (comunicación interna constructiva, colaboración y enfoque en el éxito mutuo).
          </span>
          <textarea
            id="q6-intervention"
            rows={4}
            value={answers.scenarioIntervention}
            onChange={(e) => handleTextChange('scenarioIntervention', e.target.value)}
            placeholder="Escribe exactamente lo que le dirías o propondrías en el chat o en una plática informal. Ej: 'Oye hermano, vi que escalamos el caso X. Para que no nos rebote y el cliente esté más tranquilo, ¿qué te parece si le agregamos un par de notas con el CRM?...'"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
          />
        </div>
      </div>
    </motion.div>
  );
}
