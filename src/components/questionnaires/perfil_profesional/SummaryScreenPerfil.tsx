/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, PerfilProfesionalAnswers } from '../../../types';
import { 
  UserCheck, 
  Briefcase, 
  Calendar, 
  Clock, 
  Linkedin, 
  Camera, 
  Sparkles, 
  GraduationCap, 
  Trophy, 
  Heart, 
  Building2, 
  Quote, 
  Lock, 
  Clipboard, 
  Check, 
  Download, 
  Printer, 
  RefreshCw,
  Tag,
  Compass,
  Smile,
  MessageSquare,
  Key,
  Copy,
  Pencil
} from 'lucide-react';
import { motion } from 'motion/react';

interface SummaryScreenPerfilProps {
  profile: UserProfile;
  answers: PerfilProfesionalAnswers;
  onReset: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
  editToken?: string;
}

export default function SummaryScreenPerfil({ 
  profile, 
  answers, 
  onReset, 
  onEdit, 
  readOnly = false,
  editToken 
}: SummaryScreenPerfilProps) {
  const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const activeToken = editToken || answers.editToken || profile.editToken;

  // Generate markdown report for webmasters
  const generateMarkdownReport = () => {
    let report = `# Ficha de Perfil Profesional - Website Oficial FHONS\n\n`;
    report += `**Nombre y Apellido:** ${profile.name}\n`;
    report += `**Correo Corporativo:** ${profile.email}\n`;
    report += `**Fecha de Registro:** ${profile.date}\n`;
    report += `**Token de Edición:** ${activeToken || 'N/A'}\n`;
    report += `**Cargo:** ${answers.cargo || 'N/A'}\n`;
    report += `**Desde cuándo trabaja en FHONS:** ${answers.fechaIngreso || 'N/A'}\n`;
    report += `**Años de experiencia:** ${answers.aniosExperiencia || 'N/A'}\n`;
    report += `**LinkedIn:** ${answers.linkedinUrl || 'N/A'}\n`;
    report += `**Gestión de Foto:** ${answers.fotoPreferencia === 'tengo_foto' ? 'Fotografía provista por el colaborador' : 'Coordinar sesión con equipo FHONS'}\n\n`;

    report += `## 1. Rol y Funciones en FHONS\n${answers.queHaces || 'N/A'}\n\n`;

    report += `## 2. Habilidades y Especialidades\n`;
    if (answers.habilidadesEspecialidades && answers.habilidadesEspecialidades.length > 0) {
      report += answers.habilidadesEspecialidades.map((s) => `- ${s}`).join('\n') + '\n';
    } else {
      report += `Sin habilidades seleccionadas\n`;
    }
    if (answers.habilidadesTexto) {
      report += `\n*Detalles adicionales:* ${answers.habilidadesTexto}\n`;
    }
    report += `\n`;

    report += `## 3. Estudios y Certificaciones\n${answers.estudiosCertificaciones || 'N/A'}\n\n`;
    report += `## 4. Logro Profesional Más Significativo\n${answers.logroProfesional || 'N/A'}\n\n`;
    report += `## 5. Lo que más disfruta de su trabajo\n${answers.disfruteTrabajo || 'N/A'}\n\n`;
    report += `## 6. Lo que más le gusta de trabajar en FHONS\n${answers.gustoFhons || 'N/A'}\n\n`;

    report += `## 7. Factor Humano y Personalidad\n`;
    const words = answers.tresPalabras?.filter(Boolean) || [];
    report += `- **Tres palabras que lo describen:** ${words.length > 0 ? words.join(', ') : 'N/A'}\n`;
    report += `- **Hobbies y pasatiempos:** ${answers.hobbies || 'N/A'}\n`;
    report += `- **Talento poco conocido:** ${answers.talentoOculto || 'N/A'}\n`;
    report += `- **Anécdota divertida:** ${answers.anecdotaDivertida || 'N/A'}\n`;
    report += `- **Tema para hablar horas:** ${answers.temaHoras || 'N/A'}\n`;
    report += `- **Frase o lema:** "${answers.fraseLema || 'N/A'}"\n`;
    if (answers.algoMas) {
      report += `- **Detalle adicional:** ${answers.algoMas}\n`;
    }
    report += `\n`;

    if (answers.restriccionesPrivacidad) {
      report += `## 🔒 RESTRICCIONES DE PRIVACIDAD (NO PUBLICAR EN WEB)\n`;
      report += `${answers.restriccionesPrivacidad}\n`;
    }

    return report;
  };

  const handleCopyToClipboard = () => {
    const text = generateMarkdownReport();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, answers, type: 'perfil_profesional' }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `perfil_web_fhons_${profile.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const words = answers.tresPalabras?.filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="summary-perfil-profesional">
      {/* Top Banner Actions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
              Website Oficial FHONS
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
              Ficha Lista para Publicar
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-display">
            Ficha de Perfil Profesional
          </h2>
          <p className="text-xs text-slate-500">
            Revisión final de la información para el equipo de diseño y marketing web.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            id="copy-perfil-btn"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Clipboard size={15} />}
            {copied ? '¡Copiado!' : 'Copiar Ficha'}
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            id="download-json-perfil-btn"
          >
            <Download size={15} />
            JSON
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
            id="print-perfil-btn"
          >
            <Printer size={15} />
            Imprimir / PDF
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Volver al inicio"
            >
              <RefreshCw size={14} />
              Inicio
            </button>
          )}
        </div>
      </div>

      {/* Token de Edición Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 border-2 border-amber-300/80 rounded-3xl p-6 md:p-7 shadow-lg shadow-amber-500/5 relative overflow-hidden"
        id="token-edicion-summary-card"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                TOKEN DE EDICIÓN EXCLUSIVO
              </span>
              <span className="text-xs text-amber-800 font-semibold font-mono">
                Guarda este código
              </span>
            </div>
            
            <h3 className="text-lg md:text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <Key className="text-amber-600 shrink-0" size={20} />
              Código para Modificar o Completar tu Perfil
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Con tu correo institucional (<span className="font-bold text-slate-850">{profile.email}</span>) y este código podrás volver a ingresar en cualquier momento desde la pantalla de inicio para modificar tus datos o completar secciones que hayas dejado pendientes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            {/* Token Badge */}
            <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl border-2 border-amber-300 shadow-sm justify-between gap-3 min-w-[200px]">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                  Tu Token
                </span>
                <span className="font-mono text-base md:text-lg font-black text-slate-900 tracking-wider select-all">
                  {activeToken || 'FH-PENDIENTE'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeToken) {
                    navigator.clipboard.writeText(activeToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }
                }}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-amber-200"
                title="Copiar Token"
                id="copy-token-btn"
              >
                {copiedToken ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedToken ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Direct Edit Button */}
            {!readOnly && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-900/10"
                id="btn-edit-profile-from-summary"
              >
                <Pencil size={14} />
                Editar Ficha
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Profile Showcase Card (As it appears on FHONS Official Website) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/60"
        id="official-web-card"
      >
        {/* Card Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 text-white relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar / Photo */}
            <div className="relative shrink-0 flex flex-col items-center gap-2">
              {answers.fotoUrl ? (
                <>
                  <img
                    src={answers.fotoUrl}
                    alt={profile.name}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-xl bg-slate-800"
                  />
                  <a
                    href={answers.fotoUrl}
                    download={`foto_perfil_${profile.name.replace(/\s+/g, '_').toLowerCase()}.jpg`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-mono text-white font-semibold transition"
                    title="Descargar fotografía"
                  >
                    <Download size={11} />
                    Descargar Foto
                  </a>
                </>
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-blue-900/60 border-4 border-white/20 flex flex-col items-center justify-center text-white/80 shadow-xl">
                  <Camera size={32} className="mb-1 text-blue-300" />
                  <span className="text-[10px] font-mono text-center px-2 text-blue-200 font-bold">
                    {answers.fotoPreferencia === 'coordinar_sesion' ? 'Sesión por Coordinar' : 'Foto Oficial'}
                  </span>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  EQUIPO FHONS
                </span>
                {answers.aniosExperiencia && (
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/10 text-slate-300">
                    {answers.aniosExperiencia} de experiencia
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
                {profile.name}
              </h1>

              <p className="text-base md:text-lg text-blue-200 font-medium">
                {answers.cargo || 'Colaborador FHONS'}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300 font-mono">
                {profile.email && (
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-400" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {answers.fechaIngreso && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-400" />
                    <span>En FHONS desde: {answers.fechaIngreso}</span>
                  </div>
                )}
                {answers.linkedinUrl && (
                  <a
                    href={answers.linkedinUrl.startsWith('http') ? answers.linkedinUrl : `https://${answers.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0A66C2]/30 hover:bg-[#0A66C2]/50 text-blue-100 font-bold transition border border-blue-400/30"
                  >
                    <Linkedin size={13} className="text-white" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Key Skills Badges */}
          {answers.habilidadesEspecialidades && answers.habilidadesEspecialidades.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">
                  Habilidades & Especialidades Clave
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {answers.habilidadesEspecialidades.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {answers.habilidadesTexto && (
                <p className="text-xs text-slate-600 italic pt-1">{answers.habilidadesTexto}</p>
              )}
            </div>
          )}

          {/* Role Description */}
          {answers.queHaces && (
            <div className="space-y-2 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                Rol y Responsabilidades en FHONS
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                {answers.queHaces}
              </p>
            </div>
          )}

          {/* Studies & Most Significant Achievement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
            {/* Estudios y Certificaciones */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 flex items-center gap-2">
                <GraduationCap size={15} className="text-purple-600" />
                Estudios y Certificaciones
              </h4>

              {answers.estudiosCertificacionesList && answers.estudiosCertificacionesList.length > 0 ? (
                <div className="space-y-2">
                  {answers.estudiosCertificacionesList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                          {item.tipo}
                        </span>
                        {item.estado && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.estado}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900">{item.titulo}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{item.institucion}</span>
                        {item.anio && <span className="font-mono text-slate-400">{item.anio}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : answers.estudiosCertificaciones ? (
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line">
                  {answers.estudiosCertificaciones}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No especificado</p>
              )}
            </div>

            {/* Logro Profesional */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 flex items-center gap-2">
                <Trophy size={15} className="text-emerald-600" />
                Logro Profesional Destacado
              </h4>

              {answers.logroDetallado?.titulo ? (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    {answers.logroDetallado.categoria && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        {answers.logroDetallado.categoria}
                      </span>
                    )}
                    {answers.logroDetallado.anio && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Año: {answers.logroDetallado.anio}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug">
                    {answers.logroDetallado.titulo}
                  </h5>
                  {answers.logroDetallado.descripcion && (
                    <div className="text-[11px] text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100/80">
                      <p>{answers.logroDetallado.descripcion}</p>
                    </div>
                  )}
                  {answers.logroDetallado.impacto && (
                    <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-200/80 space-y-0.5">
                      <span className="font-bold text-emerald-700 font-mono block text-[10px]">
                        IMPACTO / RESULTADO CLAVE:
                      </span>
                      <p className="font-medium">{answers.logroDetallado.impacto}</p>
                    </div>
                  )}
                  {/* Legacy fields display if present */}
                  {answers.logroDetallado.contextoReto && (
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <span className="font-bold text-amber-700 font-mono block text-[10px]">
                        DESAFÍO:
                      </span>
                      <p>{answers.logroDetallado.contextoReto}</p>
                    </div>
                  )}
                  {answers.logroDetallado.accionRealizada && (
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <span className="font-bold text-blue-700 font-mono block text-[10px]">
                        SOLUCIÓN:
                      </span>
                      <p>{answers.logroDetallado.accionRealizada}</p>
                    </div>
                  )}
                  {!answers.logroDetallado.impacto && answers.logroDetallado.impactoResultado && (
                    <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-200/80 space-y-0.5">
                      <span className="font-bold text-emerald-700 font-mono block text-[10px]">
                        RESULTADO / IMPACTO:
                      </span>
                      <p className="font-medium">{answers.logroDetallado.impactoResultado}</p>
                    </div>
                  )}
                </div>
              ) : answers.logroProfesional ? (
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line">
                  {answers.logroProfesional}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No especificado</p>
              )}
            </div>
          </div>

          {/* Passion & Culture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
            {answers.disfruteTrabajo && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 flex items-center gap-2">
                  <Heart size={15} className="text-rose-500" />
                  Lo que más disfruta de su trabajo
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {answers.disfruteTrabajo}
                </p>
              </div>
            )}

            {answers.gustoFhons && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 flex items-center gap-2">
                  <Building2 size={15} className="text-indigo-600" />
                  Lo que más le gusta de FHONS
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {answers.gustoFhons}
                </p>
              </div>
            )}
          </div>

          {/* Human Factor & Personal Insights */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <Smile size={16} className="text-amber-500" />
              Factor Humano & Personalidad
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Three words */}
              {words.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    En tres palabras
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {words.map((w) => (
                      <span key={w} className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-semibold">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies */}
              {answers.hobbies && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Hobbies & Pasatiempos
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{answers.hobbies}</p>
                </div>
              )}

              {/* Hidden Talent */}
              {answers.talentoOculto && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Talento poco conocido
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{answers.talentoOculto}</p>
                </div>
              )}
            </div>

            {/* Conversation starter & Funny Anecdote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {answers.temaHoras && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/50 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-600 flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    Tema para hablar horas
                  </span>
                  <p className="text-xs text-slate-800 font-medium">{answers.temaHoras}</p>
                </div>
              )}

              {answers.anecdotaDivertida && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-700 flex items-center gap-1.5">
                    <Smile size={13} />
                    Anécdota divertida
                  </span>
                  <p className="text-xs text-slate-800 font-medium">{answers.anecdotaDivertida}</p>
                </div>
              )}
            </div>

            {/* Personal Motto */}
            {answers.fraseLema && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 text-center space-y-1">
                <Quote size={16} className="mx-auto text-slate-400" />
                <p className="text-sm font-semibold italic text-slate-800 font-display">
                  "{answers.fraseLema}"
                </p>
              </div>
            )}

            {/* Extra Info */}
            {answers.algoMas && (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                <span>Más sobre mí: {answers.algoMas}</span>
              </div>
            )}
          </div>

          {/* Privacy Restrictions Alert Box (Visible to Admins / Webmasters) */}
          {answers.restriccionesPrivacidad && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 md:p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Lock size={15} />
                <span>RESTRICCIONES DE PRIVACIDAD SOLICITADAS POR EL COLABORADOR</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {answers.restriccionesPrivacidad}
              </p>
              <span className="text-[10px] text-amber-700 block font-mono">
                ⚠️ Atención Webmaster: Por favor, no incluyas estos datos en la versión pública del sitio web.
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
