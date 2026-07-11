/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Section4Answers } from '../../../types';
import { TECHNIQUES, OWNERSHIP_LETTERS } from './data';
import { MessageSquare, HeartHandshake, FileWarning, Check, Info, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { InputBadge } from './Section1';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface Section4Props {
  answers: Section4Answers;
  onChange: (answers: Section4Answers) => void;
}

export default function Section4({ answers, onChange }: Section4Props) {
  const [activeLetter, setActiveLetter] = useState<string>('O');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [tecnicasImage, setTecnicasImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (isImageModalOpen && !tecnicasImage) {
      setLoadingImage(true);
      const docRef = doc(db, 'app_settings', 'general');
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().tecnicas_comunicacion_img) {
          setTecnicasImage(docSnap.data().tecnicas_comunicacion_img);
        } else {
          setTecnicasImage('/media/tecnicas_comunicacion.jpg'); // Fallback
        }
      }).catch(err => {
        console.error("Error loading image from settings:", err);
        setTecnicasImage('/media/tecnicas_comunicacion.jpg'); // Fallback
      }).finally(() => {
        setLoadingImage(false);
      });
    }
  }, [isImageModalOpen]);

  const handleTextChange = (field: keyof Section4Answers, val: any) => {
    onChange({ ...answers, [field]: val });
  };

  const toggleTechnique = (techId: string) => {
    const current = answers.techniquesUsed || [];
    const updated = current.includes(techId)
      ? current.filter((id) => id !== techId)
      : [...current, techId];
    onChange({ ...answers, techniquesUsed: updated });
  };

  const setLetterScore = (letter: string, score: 'low' | 'medium' | 'high') => {
    const updatedScores = { ...answers.ownershipScores, [letter]: score };
    onChange({ ...answers, ownershipScores: updatedScores });
  };

  const badNewsCategories = [
    { id: 'escalation', label: 'Escalación externa con tiempo largo de resolución' },
    { id: 'delay', label: 'Retraso imprevisto en la fecha/hora de entrega prometida' },
    { id: 'limitation', label: 'Limitación técnica o funcionalidad no factible de desarrollar' },
    { id: 'other', label: 'Falla catastrófica o pérdida de datos' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
      id="section4-container"
    >
      {/* Introduction banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-200/60" id="section4-intro">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block mb-2">Habilidades Clave</span>
        <h3 className="text-2xl font-bold font-display">Sección 4: Comunicación y Ownership (Habilidades clave)</h3>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed font-sans">
          Las destrezas técnicas pierden su valor si no sabemos comunicarlas con impacto u omitimos hacernos cargo del dolor de cabeza de nuestro cliente. Autoevaluemos tus técnicas expresivas y tu consistencia en el ownership.
        </p>
      </div>

      {/* Question 7: Communication techniques */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q7-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="text-base font-semibold text-slate-900 font-display">
                  7. Técnicas Profesionales de Comunicación
                </h4>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition border border-blue-200"
                  title="Ver Infografía sobre Técnicas de Comunicación"
                >
                  <Info size={14} /> Ver Infografía
                </button>
              </div>
              <InputBadge type="multiple" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Selecciona cuáles de las siguientes metodologías de interacción pones en práctica habitualmente con tus clientes.
            </p>
          </div>
        </div>

        {/* Dynamic Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="techniques-grid">
          {TECHNIQUES.map((tech) => {
            const isUsed = answers.techniquesUsed?.includes(tech.id);
            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => toggleTechnique(tech.id)}
                className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-full group cursor-pointer ${
                  isUsed
                    ? 'border-slate-900 bg-white ring-2 ring-slate-900/5 shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 font-sans">{tech.name}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isUsed ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'
                    }`}>
                      {isUsed ? <Check size={11} /> : '+'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">{tech.description}</p>
                  <p className="text-[10px] text-slate-400 italic mt-3 bg-white/75 p-2.5 rounded-xl border border-slate-200/60 font-sans">
                    <span className="font-semibold text-slate-500 not-italic">Ej:</span> {tech.example}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Why the hardest is hard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-t border-slate-200 pt-6">
          <div className="md:col-span-5 space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label htmlFor="hardest-tech-select" className="text-xs font-semibold text-slate-700 block">
                ¿Cuál técnica te cuesta más aplicar?
              </label>
              <InputBadge type="single" />
            </div>
            <select
              id="hardest-tech-select"
              value={answers.hardestTechnique}
              onChange={(e) => handleTextChange('hardestTechnique', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition"
            >
              <option value="">-- Selecciona una --</option>
              {TECHNIQUES.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-7 space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label htmlFor="hardest-tech-reason" className="text-xs font-semibold text-slate-700 block">
                Explica por qué y cómo podrías mejorar tu constancia:
              </label>
              <InputBadge type="text" />
            </div>
            <input
              id="hardest-tech-reason"
              type="text"
              value={answers.hardestTechniqueReason}
              onChange={(e) => handleTextChange('hardestTechniqueReason', e.target.value)}
              placeholder="Ej: 'Me cuesta porque me desespero y quiero dar el fix técnico de inmediato sin escuchar del todo...'"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Question 8: Ownership letters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q8-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <HeartHandshake size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                8. Evaluando el Ownership Framework (OWNERSHIP)
              </h4>
              <InputBadge type="single" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Haz clic en cada letra del acrónimo <strong>OWNERSHIP</strong>, evalúa con qué consistencia la aplicas en tus tickets y detecta tus áreas críticas de trazabilidad.
            </p>
          </div>
        </div>

        {/* Letter Tabs matrix */}
        <div className="flex justify-between items-center gap-1.5 overflow-x-auto pb-1" id="letters-carousel">
          {OWNERSHIP_LETTERS.map((item) => {
            const score = answers.ownershipScores[item.letter] || 'medium';
            const isActive = activeLetter === item.letter;

            return (
              <button
                key={item.letter}
                type="button"
                onClick={() => setActiveLetter(item.letter)}
                className={`flex-1 min-w-[38px] h-12 rounded-xl font-mono font-bold text-sm transition flex flex-col items-center justify-center relative cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md transform scale-105 z-10 border border-slate-900'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{item.letter}</span>
                {/* Micro bullet showing color score */}
                <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                  score === 'high' ? 'bg-slate-400' : score === 'medium' ? 'bg-slate-500' : 'bg-red-400'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Active Letter Detail Box */}
        {(() => {
          const item = OWNERSHIP_LETTERS.find((l) => l.letter === activeLetter)!;
          const score = answers.ownershipScores[item.letter] || 'medium';

          return (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4" id="active-letter-panel">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900 font-mono">{item.letter}</span>
                    <span className="text-sm font-bold text-slate-850 font-sans">{item.concept}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-xl font-sans">{item.description}</p>
                </div>

                {/* Score Toggle for this letter */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">Tu Consistencia</span>
                    <InputBadge type="single" />
                  </div>
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLetterScore(item.letter, lvl)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                          score === lvl
                            ? lvl === 'high'
                              ? 'bg-slate-900 text-white'
                              : lvl === 'medium'
                              ? 'bg-slate-400 text-white'
                              : 'bg-red-200 text-red-900 border border-red-300 shadow-xs'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {lvl === 'high' ? 'Alta' : lvl === 'medium' ? 'Media' : 'Baja'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Ownership deep thoughts */}
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label htmlFor="ownership-details" className="text-xs font-semibold text-slate-700 block">
              ¿En qué letras de OWNERSHIP consideras que fallas más seguido y por qué?
            </label>
            <InputBadge type="text" />
          </div>
          <span className="text-[10px] text-slate-400 block -mt-1 mb-2">
            Tip: Relaciona con la Gestión del Requerimiento, Trazabilidad (Ayer-Hoy-Bloqueos) y la constancia de documentar avances en el CRM.
          </span>
          <textarea
            id="ownership-details"
            rows={3}
            value={answers.ownershipDetails}
            onChange={(e) => handleTextChange('ownershipDetails', e.target.value)}
            placeholder="Ej: 'Fallo constantemente en la R (Responsive communication) e I (Inform continuously). Cuando me saturo de tickets, me encierro a codificar el fix y dejo al usuario en silencio absoluto por horas...'"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
          />
        </div>
      </div>

      {/* Question 9: Malas noticias */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="q9-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl">
            <FileWarning size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h4 className="text-base font-semibold text-slate-900 font-display">
                9. El Arte de Comunicar Malas Noticias
              </h4>
              <InputBadge type="single" />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Recuerda una ocasión reciente donde tuviste que notificar una limitación técnica severa, retrasos o un escalamiento doloroso. ¿Cómo lo manejaste?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="q9-fields">
          {/* Left: Category and outcome */}
          <div className="md:col-span-5 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <label htmlFor="badnews-cat-select" className="text-xs font-semibold text-slate-700 block">
                  Piensa en un caso donde diste una mala noticia:
                </label>
                <InputBadge type="single" />
              </div>
              <select
                id="badnews-cat-select"
                value={answers.badNewsCategory}
                onChange={(e) => handleTextChange('badNewsCategory', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition"
              >
                <option value="">-- Selecciona el tipo de caso --</option>
                {badNewsCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <label htmlFor="badnews-perception-select" className="text-xs font-semibold text-slate-700 block">
                  ¿Cuál fue la reacción de ese cliente al decírselo?
                </label>
                <InputBadge type="single" />
              </div>
              <select
                id="badnews-perception-select"
                value={answers.badNewsReflection}
                onChange={(e) => handleTextChange('badNewsReflection', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition"
              >
                <option value="">-- Selecciona la reacción --</option>
                <option value="confidence">El cliente comprendió y agradeció la honestidad técnica</option>
                <option value="uncertainty">El cliente quedó inconforme, confundido o frustrado</option>
              </select>
            </div>
          </div>

          {/* Right: Text details */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label htmlFor="badnews-comms" className="text-xs font-semibold text-slate-700 block">
                ¿Cómo se lo dijiste? Describe las palabras que usaste y por qué crees que reaccionó así:
              </label>
              <InputBadge type="text" />
            </div>
            <textarea
              id="badnews-comms"
              rows={5}
              value={answers.badNewsCommunication}
              onChange={(e) => handleTextChange('badNewsCommunication', e.target.value)}
              placeholder="Ej: 'Le llamé para explicarle que el proveedor externo nos retrasó 2 días, asumí la responsabilidad y le propuse una alternativa temporal...'"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-sans"
            />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Técnicas Profesionales de Comunicación</h3>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 flex justify-center items-center bg-slate-50 min-h-[300px]">
                {loadingImage ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Loader2 size={32} className="animate-spin" />
                    <p className="text-sm">Cargando infografía...</p>
                  </div>
                ) : (
                  <img 
                    src={tecnicasImage || '/media/tecnicas_comunicacion.jpg'} 
                    alt="Infografía Técnicas de Comunicación"
                    className="max-w-full h-auto rounded-xl shadow-sm border border-slate-200"
                    onError={(e) => {
                      // Fallback if image not found
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-center text-slate-500 py-8"><p>La imagen no está disponible. Por favor, súbela desde Configuraciones en el panel de administrador.</p></div>';
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
