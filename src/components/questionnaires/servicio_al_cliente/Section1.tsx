/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Section1Answers } from '../../../types';
import { ShieldAlert, ArrowRightLeft, Smile } from 'lucide-react';
import { motion } from 'motion/react';

interface Section1Props {
  answers: Section1Answers;
  onChange: (answers: Section1Answers) => void;
}

export function InputBadge({ type }: { type: 'slider' | 'single' | 'multiple' | 'text' }) {
  const config = {
    slider: { label: 'Deslizar para ajustar', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    single: { label: 'Haz clic para seleccionar una sola opción', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    multiple: { label: 'Selección múltiple (marca las casillas correspondientes)', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    text: { label: 'Completa el campo escribiendo tu respuesta', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  };
  const { label, color } = config[type];
  return (
    <span className={`inline-flex items-center text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}

export default function Section1({ answers, onChange }: Section1Props) {
  const handlePercentChange = (val: number) => {
    onChange({ ...answers, energyTech: val });
  };

  const handleTextChange = (field: keyof Section1Answers, value: any) => {
    onChange({ ...answers, [field]: value });
  };

  const toggleEvidence = (evidence: string) => {
    const current = answers.evidences || [];
    const updated = current.includes(evidence)
      ? current.filter((e) => e !== evidence)
      : [...current, evidence];
    onChange({ ...answers, evidences: updated });
  };

  const evidenceOptions = [
    { id: 'tone', label: 'Mensaje final con agradecimiento explícito o tono muy cálido/aliviado.' },
    { id: 'no_reopen', label: 'Cero reaperturas de ticket o de requerimientos repetidos.' },
    { id: 'rating', label: 'Agradecimiento directo verbal, felicitación o comentarios positivos expresados por el cliente.' },
    { id: 'ownership_mention', label: 'El cliente destacó explícitamente mi nombre o mi dedicación en su feedback.' },
    { id: 'survey', label: 'Excelente calificación en la Encuesta de Satisfacción (CSAT/NPS).' }
  ];

  const experienceOptions = [
    {
      id: 'only_tech',
      title: 'Solo solución técnica',
      description: 'El problema se arregló pero el tono general del cierre fue frío o mecánico. Sin cercanía.',
      color: 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
    },
    {
      id: 'partial_relation',
      title: 'Solución técnica con cierto trato',
      description: 'Hubo cortesía básica y flujo informativo aceptable, pero no un acompañamiento memorable.',
      color: 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
    },
    {
      id: 'excellent_ownership',
      title: 'Acompañamiento memorable completo',
      description: 'El usuario sintió que me adueñé de su estrés, dándole paz mental, además de resolver el problema técnico.',
      color: 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
      id="section1-container"
    >
      {/* Intro Box */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-200/60" id="section1-intro">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-2">Evaluación de Proceso</span>
        <h3 className="text-2xl font-bold font-display">Sección 1: Atención vs Servicio al Cliente</h3>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed font-sans">
          Comencemos con un autodiagnóstico inicial. Aquí analizamos la diferencia entre solucionar un ticket técnico y adueñarse realmente de la experiencia del cliente para generar un impacto positivo sostenible.
        </p>
      </div>

      {/* Question 1: Energy Split Slider */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q1-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <ArrowRightLeft size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                1. Distribución de Energía Profesional
              </h4>
              <InputBadge type="slider" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              En tu día a día, cuando abres un ticket o respondes un chat/correo, ¿qué porcentaje de tu energía dirías que dedicas a “resolver el problema técnico” versus “hacer que el usuario se sienta comprendido, informado y acompañado”? ¿Por qué ese porcentaje?
            </p>
          </div>
        </div>

        {/* Visual Split Gauge */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-6" id="q1-split-gauge">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-white border border-slate-200/50 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block font-mono">Enfoque Técnico</span>
              <span className="text-3xl font-mono font-bold text-slate-900 mt-1 block">{answers.energyTech}%</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Resolver problemas, logs, configuración</span>
            </div>
            <div className="p-4 bg-white border border-slate-200/50 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block font-mono">Acompañamiento Humano</span>
              <span className="text-3xl font-mono font-bold text-slate-600 mt-1 block">{100 - answers.energyTech}%</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Empatía, feedback constante, contención</span>
            </div>
          </div>

          {/* Slider Element */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={answers.energyTech}
              onChange={(e) => handlePercentChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              id="energy-range-slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400 px-1 font-mono">
              <span>0% Técnico / 100% Humano</span>
              <span>50% / 50% Equilibrado</span>
              <span>100% Técnico / 0% Humano</span>
            </div>
          </div>
        </div>

        {/* Why Reason text area */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="q1-reason" className="text-xs font-semibold text-slate-700">
              ¿Por qué consideras que esta es la distribución de energía que aplicas y qué impacto genera?
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="q1-reason"
            rows={3}
            placeholder="Describe brevemente tus razones (ej. 'La complejidad técnica absorbe la mayoría de mi tiempo...' o 'Me esfuerzo por balancear mandando mensajes con empatía...')"
            value={answers.energyReason}
            onChange={(e) => handleTextChange('energyReason', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Question 2: Last complex ticket */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q2-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Smile size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                2. El Cierre del Último Ticket Complejo
              </h4>
              <InputBadge type="single" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Recuerda el último ticket complejo que resolviste. ¿El usuario se fue solo con la solución técnica o también con la sensación de que alguien se hizo cargo de su problema?
            </p>
          </div>
        </div>

        {/* Selected Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="q2-cards">
          {experienceOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleTextChange('ticketExperience', opt.id)}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between h-full cursor-pointer ${
                answers.ticketExperience === opt.id
                  ? 'border-slate-900 ring-2 ring-slate-900/5 bg-white shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div>
                <span className="text-sm font-semibold text-slate-800 block">{opt.title}</span>
                <p className="text-slate-500 text-xs mt-1.5 leading-normal">{opt.description}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <input
                  type="radio"
                  checked={answers.ticketExperience === opt.id}
                  readOnly
                  className="h-4 w-4 accent-slate-900"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Evidence Checkboxes */}
        <div className="space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              ¿Qué evidencias concretas tienes sobre la percepción del cliente de que se sintió atendido o servido?
            </span>
            <InputBadge type="multiple" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidenceOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-4 rounded-xl border text-xs cursor-pointer select-none transition ${
                  answers.evidences?.includes(opt.id)
                    ? 'bg-slate-100 border-slate-400 text-slate-900 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={answers.evidences?.includes(opt.id)}
                  onChange={() => toggleEvidence(opt.id)}
                  className="mt-0.5 rounded text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-950"
                />
                <span className="leading-tight">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Details Text */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="q2-details" className="text-xs font-semibold text-slate-700">
              Describe el caso técnico brevemente y amplía sobre estas evidencias (piensa en el tono de su último mensaje o llamada de cierre):
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="q2-details"
            rows={3}
            placeholder="Explica qué pasó, cuál era el problema técnico, qué evidencias detectaste en el tono de llamada, chat o correo final..."
            value={answers.evidenceDetails}
            onChange={(e) => handleTextChange('evidenceDetails', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Question 3: Scenario ERP */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q3-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 font-display">
              3. Escenario Crítico: ERP Inactivo por 3 Días
            </h4>
            <p className="text-slate-500 text-xs mt-1">
              Un usuario frustrado escribe: <span className="italic font-medium text-slate-700">“Llevo 3 días sin poder trabajar con el ERP, ya perdí X ventas”.</span>
            </p>
          </div>
        </div>

        {/* Written response area */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="q3-diff" className="text-xs font-semibold text-slate-700">
              ¿Cuál crees que es la diferencia clave entre limitarse a "atender" el aspecto técnico de este caso, y verdaderamente "servir" al usuario ofreciendo una experiencia excelente?
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="q3-diff"
            rows={2}
            placeholder="Describe la diferencia (ej. empatía, hacerse responsable, calmar la frustración)..."
            value={answers.atenderVsServirDescription}
            onChange={(e) => handleTextChange('atenderVsServirDescription', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
          />
        </div>

        {/* Side-by-side Response Drafting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="q3-drafting">
          <div className="space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label htmlFor="q3-today" className="text-xs font-semibold text-slate-700">
                Respuesta Habitual: ¿Cómo le responderías hoy?
              </label>
              <InputBadge type="text" />
            </div>
            <textarea
              id="q3-today"
              rows={4}
              placeholder="Escribe la respuesta exacta que le enviarías bajo tu día a día habitual..."
              value={answers.responseToday}
              onChange={(e) => handleTextChange('responseToday', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label htmlFor="q3-highest" className="text-xs font-semibold text-slate-700">
                Respuesta Ideal: ¿Cómo le responderías aplicando 10/10 en excelencia y empatía?
              </label>
              <InputBadge type="text" />
            </div>
            <textarea
              id="q3-highest"
              rows={4}
              placeholder="Reescribe tu respuesta integrando mayor empatía, entendimiento del caso y tiempos claros..."
              value={answers.responseHighService}
              onChange={(e) => handleTextChange('responseHighService', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
