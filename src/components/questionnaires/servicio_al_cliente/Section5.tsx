/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Section5Answers } from '../../../types';
import { Users2, MessageCircle, Heart, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { InputBadge } from './Section1';

interface Section5Props {
  answers: Section5Answers;
  onChange: (answers: Section5Answers) => void;
}

export default function Section5({ answers, onChange }: Section5Props) {
  const handleTextChange = (field: keyof Section5Answers, val: any) => {
    onChange({ ...answers, [field]: val });
  };

  const togglePractice = (practiceId: string) => {
    const current = answers.practices || [];
    const updated = current.includes(practiceId)
      ? current.filter((id) => id !== practiceId)
      : [...current, practiceId];
    onChange({ ...answers, practices: updated });
  };

  const toggleSelfRecognized = (bhId: string) => {
    const current = answers.selfRecognizedBehaviors || [];
    const updated = current.includes(bhId)
      ? current.filter((id) => id !== bhId)
      : [...current, bhId];
    onChange({ ...answers, selfRecognizedBehaviors: updated });
  };

  const practiceOptions = [
    { id: 'share', label: 'Comparto conocimientos técnicos clave de mis capacitaciones y certificaciones.' },
    { id: 'feedback', label: 'Doy retroalimentación de servicio constructiva y empática a mis compañeros.' },
    { id: 'escalations', label: 'Ayudo proactivamente en la resolución de casos bloqueados de otros.' },
    { id: 'document', label: 'Documento minuciosamente mis soluciones en el CRM para ahorrar tiempo al equipo.' }
  ];

  const behaviorItems = [
    { id: 'prof', label: 'Profesionalismo en el trato difícil', type: 'positive' },
    { id: 'adapt', label: 'Adaptar el vocabulario según el usuario', type: 'positive' },
    { id: 'silence', label: 'Silencio administrativo (no responder en horas)', type: 'negative' },
    { id: 'blame', label: 'Culpar abiertamente a sistemas externos', type: 'negative' },
    { id: 'discipline', label: 'Disciplina operativa en el registro del CRM', type: 'positive' },
    { id: 'excuses', label: 'Dar excusas excesivas sobre la carga interna', type: 'negative' }
  ];

  const colleagueActions = [
    { id: 'feedback_directo', label: 'Dar retroalimentación directa y privada: Hablar con él de forma constructiva sobre cómo su tono afecta al cliente.' },
    { id: 'apoyo_redaccion', label: 'Ofrecer ayuda práctica: Revisar juntos algunos tickets para sugerirle pequeños ajustes de empatía.' },
    { id: 'compartir_mejores_practicas', label: 'Fomentar buenas prácticas: Compartir ejemplos de tickets exitosos en reuniones de equipo para que todos aprendan.' },
    { id: 'dejar_que_lider_actue', label: 'Derivarlo al líder: Considerar que es un tema de desempeño que debe manejar directamente el supervisor.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
      id="section5-container"
    >
      {/* Introduction banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-200/60" id="section5-intro">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-2">Cultura de Equipo</span>
        <h3 className="text-2xl font-bold font-display">Sección 5: Trabajo en Equipo y Cultura</h3>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed font-sans">
          Ningún agente destaca en solitario. La cultura de servicio de excelencia se nutre de la colaboración interna, la empatía entre colegas y la disciplina operativa mutua. Evaluemos tu contribución grupal.
        </p>
      </div>

      {/* Question 10: Contributing to the team */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q10-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Users2 size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                10. Elevando Colectivamente el Estándar
              </h4>
              <InputBadge type="multiple" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              ¿De qué forma contribuyes activamente a que tus compañeros de equipo eleven su nivel de servicio técnico y humano?
            </p>
          </div>
        </div>

        {/* Practice checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="q10-practices">
          {practiceOptions.map((opt) => {
            const checked = answers.practices?.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-4 rounded-xl border text-xs cursor-pointer select-none transition ${
                  checked
                    ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePractice(opt.id)}
                  className="mt-0.5 rounded text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-950"
                />
                <span className="leading-tight">{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Contribution description textarea */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="team-example" className="text-xs font-semibold text-slate-700 block">
              Escribe un ejemplo reciente de cómo apoyaste a otro colega (técnica o comunicativamente):
            </label>
            <InputBadge type="text" />
          </div>
          <textarea
            id="team-example"
            rows={3}
            value={answers.teamContributionExample}
            onChange={(e) => handleTextChange('teamContributionExample', e.target.value)}
            placeholder="Ej: 'Ayer mi compañero no podía resolver la sincronización del ERP. Me conecté con él 10 minutos y le mostré cómo depurar los hilos caídos, además de sugerirle una plantilla para avisarle al usuario...'"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
          />
        </div>
      </div>

      {/* Question 11: Co-worker scenario */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q11-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <Heart size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                11. Escenario Crítico: El Técnico Brillante pero Seco
              </h4>
              <InputBadge type="single" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Un compañero es una eminencia técnica resolviendo problemas (Troubleshooting fuerte) pero su comunicación escrita es ruda, seca u omite responder dudas de forma paciente, lo que provoca constantes reclamos de servicio de los clientes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="q11-fields">
          {/* Action selection */}
          <div className="md:col-span-5 space-y-3">
            <label htmlFor="colleague-action-select" className="text-xs font-semibold text-slate-700 block mb-1">
              ¿Cómo actuarías tú como compañero de equipo para apoyarlo profesionalmente?
            </label>
            <div className="space-y-2">
              {colleagueActions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleTextChange('colleagueAction', act.id)}
                  className={`w-full p-4 rounded-xl border text-xs text-left transition flex justify-between items-center cursor-pointer ${
                    answers.colleagueAction === act.id
                      ? 'border-slate-900 bg-white ring-2 ring-slate-900/5 text-slate-900 font-semibold shadow-md'
                      : 'border-slate-250 bg-slate-50/50 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <span>{act.label}</span>
                  {answers.colleagueAction === act.id && <Check size={14} className="text-slate-900 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dialogue text */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label htmlFor="colleague-dialogue" className="text-xs font-semibold text-slate-700 block">
                Redacta tus palabras de acercamiento empático como compañero de equipo:
              </label>
              <InputBadge type="text" />
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1 mb-2">
              Tip: Apóyate en el compañerismo y la colaboración constructiva, respetando y valorando siempre su gran capacidad técnica.
            </span>
            <textarea
              id="colleague-dialogue"
              rows={5}
              value={answers.colleagueDialogue}
              onChange={(e) => handleTextChange('colleagueDialogue', e.target.value)}
              placeholder="¿Qué le dirías o cómo abordarías la situación? Ej: 'Oye, vi que el cliente se asustó un poco por el cierre de ayer. ¿Qué tal si para la próxima le agregamos un poco más de contexto?...'"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
            />
          </div>
        </div>
      </div>

      {/* Question 12: Strengthen vs Weaken behaviors */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q12-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                12. Dinámica de Confianza en el Cliente
              </h4>
              <InputBadge type="multiple" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              En el soporte técnico, ciertas prácticas consolidan la confianza del cliente (como el profesionalismo, la adaptabilidad y la disciplina operativa de registro), mientras que otras conductas la deterioran gravemente (como el silencio administrativo, culpar a sistemas externos o dar excusas de saturación).
            </p>
          </div>
        </div>

        {/* Self-recognition checklist */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-700 block">
            Analiza con sinceridad tu desempeño actual: ¿En cuáles de estos comportamientos (tanto positivos a potenciar como negativos a corregir) te reconoces hoy en tu día a día?
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="self-recognition-grid">
            {behaviorItems.map((bh) => {
              const checked = answers.selfRecognizedBehaviors?.includes(bh.id);
              return (
                <label
                  key={bh.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-xs cursor-pointer select-none transition ${
                    checked
                      ? bh.type === 'positive'
                        ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                        : 'bg-red-50 border-red-300 text-red-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelfRecognized(bh.id)}
                    className="mt-1 rounded text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-950"
                  />
                  <div>
                    <span className="font-semibold leading-tight block">{bh.label}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase block mt-1 ${bh.type === 'positive' ? 'text-slate-500' : 'text-red-500'}`}>
                      {bh.type === 'positive' ? 'Fortalece Servicio' : 'Debilita Servicio'}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
