/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, QuestionnaireAnswers } from '../../../types';
import { PILLARS, PROCESS_STAGES } from './data';
import { Download, Clipboard, RefreshCw, Sparkles, Award, FileText, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface SummaryScreenProps {
  profile: UserProfile;
  answers: QuestionnaireAnswers;
  onReset: () => void;
  readOnly?: boolean;
}

export default function SummaryScreen({ profile, answers, onReset, readOnly = false }: SummaryScreenProps) {
  const [copied, setCopied] = useState(false);

  // Calculate average pillar rating
  const averageRating = (
    PILLARS.reduce((sum, p) => sum + (answers.section2.pillars[p.id]?.rating || 5), 0) / PILLARS.length
  ).toFixed(1);

  // Generate markdown report
  const generateMarkdownReport = () => {
    let report = `# Reporte de Autoevaluación de Soporte TI\n`;
    report += `**Evaluado:** ${profile.name}\n`;
    report += `**Correo:** ${profile.email}\n`;
    report += `**Fecha:** ${profile.date}\n`;
    report += `**Promedio General Pilares:** ${averageRating} / 10\n\n`;

    report += `## Sección 1: Atención vs Servicio al Cliente\n`;
    report += `- **Distribución de Energía:** ${answers.section1.energyTech}% Técnico / ${100 - answers.section1.energyTech}% Acompañamiento Humano\n`;
    report += `- **Razón de proporción:** ${answers.section1.energyReason || 'N/A'}\n`;
    report += `- **Percepción último ticket:** ${answers.section1.ticketExperience || 'N/A'}\n`;
    report += `- **Detalles evidencias:** ${answers.section1.evidenceDetails || 'N/A'}\n`;
    report += `- **Redacción Hoy:** "${answers.section1.responseToday || 'N/A'}"\n`;
    report += `- **Redacción Nivel 10/10:** "${answers.section1.responseHighService || 'N/A'}"\n\n`;

    report += `## Sección 2: Calificaciones de los 8 Pilares\n`;
    PILLARS.forEach((p) => {
      const pEval = answers.section2.pillars[p.id] || { rating: 5, backlogExample: '', tenOverTenBehavior: '' };
      report += `### ${p.name}: ${pEval.rating}/10\n`;
      report += `- *Ejemplo Backlog:* ${pEval.backlogExample || 'Sin detalle'}\n`;
      report += `- *Comportamiento 10/10:* ${pEval.tenOverTenBehavior || 'Sin detalle'}\n`;
    });
    report += `\n`;

    report += `## Sección 3: Mentalidad y Proceso\n`;
    report += `- **Chequeo Mental:** ${answers.section3.chequeoType === 'proactive' ? 'Proactivo' : 'Reactivo'}\n`;
    report += `- **Razonamiento:** ${answers.section3.chequeoReason || 'N/A'}\n`;
    report += `### Autoevaluación Ciclo de Tíckets:\n`;
    PROCESS_STAGES.forEach((s) => {
      const score = answers.section3.processScores[s.id] || 'N/A';
      const text = answers.section3.processContribution[s.id] || 'N/A';
      report += `- **${s.name} (${s.technicalTerm}):** ${score.toUpperCase()} - ${text}\n`;
    });
    report += `- **Puntos Ciegos:** ${answers.section3.blindSpots || 'N/A'}\n`;
    report += `- **Escenario Escalación Vacía (Intervención):** ${answers.section3.scenarioIntervention || 'N/A'}\n\n`;

    report += `## Sección 4: Habilidades Clave\n`;
    report += `- **Técnicas de comunicación que usa:** ${answers.section4.techniquesUsed?.join(', ') || 'Ninguna'}\n`;
    report += `- **Técnica más difícil:** ${answers.section4.hardestTechnique || 'N/A'} - ${answers.section4.hardestTechniqueReason || 'N/A'}\n`;
    report += `- **Fallas de Ownership (Framework):** ${answers.section4.ownershipDetails || 'N/A'}\n`;
    report += `- **Último caso dando malas noticias:** ${answers.section4.badNewsCommunication || 'N/A'}\n\n`;

    report += `## Sección 5: Trabajo en Equipo y Cultura\n`;
    report += `- **Ejemplo apoyo técnico/comunicativo:** ${answers.section5.teamContributionExample || 'N/A'}\n`;
    report += `- **Intervención Técnico Seco (Diálogo):** "${answers.section5.colleagueDialogue || 'N/A'}"\n\n`;

    report += `## Sección 6: Compromiso de Servicio\n`;
    report += `- **Checklist de Cierre:** Completó ${answers.section6.checklist?.length || 0} de ${checklistOptionsCount} puntos.\n`;
    report += `- **Calificación de cercanía filosófica:** ${answers.section6.philosophicalRating} / 10\n`;
    report += `- **Una sola acción en 2 semanas:** ${answers.section6.twoWeeksChange || 'N/A'}\n`;
    report += `- **Compromiso personal (${answers.section6.commitmentType}):** ${answers.section6.commitmentText || 'N/A'}\n`;
    report += `\n**Firmado Digitalmente por:** ${answers.section6.signature || profile.name}\n`;

    return report;
  };

  const checklistOptionsCount = 5;

  const handleCopyToClipboard = () => {
    const reportText = generateMarkdownReport();
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, answers, averageRating }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `evaluacion_fhons_${profile.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-8 pb-10 font-sans"
      id="summary-screen-container"
    >
      {/* Thanks Closing Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 text-center relative overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-850" id="summary-thanks-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800/10 rounded-full blur-3xl -z-10" />
        
        <div className="inline-flex p-3 bg-white/10 border border-white/20 text-white rounded-full mb-4">
          <Award size={32} />
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-3 font-display">¡Muchas Gracias, {profile.name}!</h2>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Has completado con éxito este cuestionario introspectivo de autoevaluación. Recuerda que no existen respuestas incorrectas: este ejercicio busca sensibilizar tu visión y perfeccionar tu proceso técnico y humano con tus clientes de soporte técnico.
        </p>

        {/* Floating Metadata badge */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 bg-slate-800/50 px-5 py-2.5 rounded-full border border-slate-700/60 font-mono">
          <span><strong>Agente:</strong> {profile.name}</span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span><strong>Correo:</strong> {profile.email}</span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span><strong>Fecha:</strong> {profile.date}</span>
        </div>
      </div>

      {/* Action panel */}
      {!readOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="summary-action-panel">
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="p-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 transition duration-150 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
          >
            <span className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl group-hover:scale-105 transition duration-150">
              {copied ? <Check size={18} /> : <Clipboard size={18} />}
            </span>
            <span className="text-xs font-semibold text-slate-800 font-display">
              {copied ? '¡Copiado al Portapapeles!' : 'Copiar Reporte Completo'}
            </span>
            <span className="text-[10px] text-slate-400">Exporta en formato Markdown</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="p-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 transition duration-150 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
          >
            <span className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl group-hover:scale-105 transition duration-150">
              <Download size={18} />
            </span>
            <span className="text-xs font-semibold text-slate-800 font-display">Descargar Ficha JSON</span>
            <span className="text-[10px] text-slate-400">Guarda un respaldo de tus datos</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 transition duration-150 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
          >
            <span className="p-2.5 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl group-hover:rotate-180 transition duration-300">
              <RefreshCw size={18} />
            </span>
            <span className="text-xs font-semibold text-slate-800 font-display">Realizar de Nuevo</span>
            <span className="text-[10px] text-slate-400">Reiniciar respuestas completas</span>
          </button>
        </div>
      )}

      {/* Visual report layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="summary-report-layout">
        
        {/* Left Side: Summary Metrics */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-6" id="summary-metrics-section">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            <FileText className="text-slate-900" size={18} />
            <h3 className="text-base font-bold text-slate-800 font-display">Diagnóstico de los 8 Pilares</h3>
          </div>

          {/* Pillars visual bars */}
          <div className="space-y-4" id="summary-pillars-bars">
            {PILLARS.map((p) => {
              const pEval = answers.section2.pillars[p.id] || { rating: 5, backlogExample: '', tenOverTenBehavior: '' };
              const score = pEval.rating;
              const percent = (score / 10) * 100;

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{p.name}</span>
                    <span className="font-mono font-bold text-slate-400">{score} / 10</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 8
                          ? 'bg-slate-900'
                          : score >= 5
                          ? 'bg-slate-500'
                          : 'bg-red-300'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Core Commitment Stamp Card */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 flex flex-col justify-between" id="summary-stamp-card">
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Sparkles className="text-slate-900" size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Pacto de Compromiso</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Plan 2 Semanas:</span>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic">
                  "{answers.section6.twoWeeksChange || 'Me comprometo a perfeccionar mi empatía diaria en el backlog de tickets.'}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Promesa Central:</span>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {answers.section6.commitmentText || 'Brindar soporte de manera empática y proactiva, asumiendo plena responsabilidad por cada interacción.'}
                </p>
              </div>
            </div>
          </div>

          {/* Seal Graphic signature stamp */}
          <div className="mt-8 border-t border-slate-200 pt-5 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black tracking-widest uppercase">
              TI
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest font-mono">Excelencia en Servicio</span>
            
            {/* Signature name */}
            <div className="py-2">
              <span className="font-serif italic text-base text-slate-950 block tracking-wider">
                {answers.section6.signature || profile.name}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Firma del Colaborador</span>
            </div>
          </div>
        </div>

      </div>

      {/* Troubleshooting workflow snapshot */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-4" id="summary-troubleshooting-workflow">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-850 font-display">Resumen de Ciclo de Trabajo (Troubleshooting)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" id="workflow-badges-grid font-sans">
          {PROCESS_STAGES.map((s) => {
            const score = answers.section3.processScores[s.id] || 'neutral';
            return (
              <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 block truncate">{s.name}</span>
                <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase rounded-md ${
                  score === 'strong'
                    ? 'bg-slate-900 text-white'
                    : score === 'neutral'
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-red-50 text-red-900 border border-red-200 font-medium'
                }`}>
                  {score === 'strong' ? 'Fortaleza' : score === 'neutral' ? 'Aceptable' : 'Mejorar'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
