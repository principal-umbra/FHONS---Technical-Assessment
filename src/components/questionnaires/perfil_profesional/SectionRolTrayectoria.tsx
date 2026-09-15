/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PerfilProfesionalAnswers, UserProfile } from '../../../types';
import { Briefcase, Calendar, Award, UserCheck, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';

interface SectionRolTrayectoriaProps {
  answers: PerfilProfesionalAnswers;
  profile: UserProfile;
  onChange: (updatedAnswers: PerfilProfesionalAnswers) => void;
}

export default function SectionRolTrayectoria({ answers, profile, onChange }: SectionRolTrayectoriaProps) {
  const quickExperienceOptions = [
    'Menos de 1 año',
    '1 a 3 años',
    '4 a 6 años',
    '7 a 10 años',
    'Más de 10 años'
  ];

  // Helper to get formatted Spanish date
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '';
    // If it's already a full date YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    }
    return dateStr;
  };

  // Helper to compute tenure
  const getTenureBadge = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return null;
    if (years === 0 && months === 0) return 'Reciente incorporación a FHONS';
    const chunks = [];
    if (years > 0) chunks.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (months > 0) chunks.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    return `${chunks.join(' y ')} de trayectoria en FHONS`;
  };

  // Convert raw value to YYYY-MM-DD if valid, or default
  const datePickerValue = (() => {
    if (!answers.fechaIngreso) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(answers.fechaIngreso)) {
      return answers.fechaIngreso;
    }
    const d = new Date(answers.fechaIngreso);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return '';
  })();

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6" id="section-rol-trayectoria">
      {/* Collaborator Identified Banner (Name and email registered at identification) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 font-bold">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                Colaborador Identificado
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-medium">
                Registrado para Web Oficial
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold font-display text-white">{profile.name}</h3>
          </div>
        </div>
        <div className="text-xs text-slate-300 font-mono">
          <span>{profile.email}</span>
        </div>
      </div>

      {/* Card: Cargo y Rol en FHONS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-850 font-display">1. Cargo y Funciones en FHONS</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  Obligatoria
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ¿Cuál es tu cargo y qué haces en FHONS? Esta información se mostrará como encabezado en tu ficha web.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="perfil-cargo" className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Cargo Oficial / Título del Puesto *
            </label>
            <input
              id="perfil-cargo"
              type="text"
              placeholder="Ej. Especialista de Soporte TI / Administrador de Sistemas"
              value={answers.cargo}
              onChange={(e) => onChange({ ...answers, cargo: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="perfil-que-haces" className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              ¿Qué haces en FHONS? (Resumen de tus responsabilidades y aporte) *
            </label>
            <textarea
              id="perfil-que-haces"
              rows={4}
              placeholder="Describe en pocas líneas tu función principal, cómo ayudas a los clientes y compañeros, y el impacto de tu labor cotidiana..."
              value={answers.queHaces}
              onChange={(e) => onChange({ ...answers, queHaces: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              💡 Consejo: Redáctalo de manera clara y profesional para que cualquier cliente o visitante comprenda tu rol.
            </p>
          </div>
        </div>
      </div>

      {/* Card: Antigüedad y Años de Experiencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desde cuándo trabajas en FHONS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold font-display">2. ¿Desde cuándo trabajas en FHONS?</h4>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                    Obligatoria
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Selecciona tu fecha de ingreso en el calendario</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Interactive Calendar Input Component */}
            <div className="relative">
              <input
                id="perfil-fecha-ingreso"
                type="date"
                max={todayStr}
                value={datePickerValue}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ ...answers, fechaIngreso: val });
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition cursor-pointer font-sans"
              />
            </div>

            {/* Display formatted date and calculated tenure */}
            {answers.fechaIngreso ? (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    {formatFriendlyDate(answers.fechaIngreso)}
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 font-semibold uppercase">
                    Fecha Registrada
                  </span>
                </div>
                {getTenureBadge(answers.fechaIngreso) && (
                  <p className="text-xs text-blue-700 font-medium">
                    🎯 {getTenureBadge(answers.fechaIngreso)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Abre el selector para escoger el día, mes y año de tu ingreso.
              </p>
            )}

            {/* Quick Year Shortcuts to assist rapid selection */}
            <div className="pt-1">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block mb-1.5">
                Acceso rápido por año:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['2025', '2024', '2023', '2022', '2021', '2020'].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      // Set mid-year or default for that year if not already set, or preserve month if already set
                      const currentMonth = datePickerValue ? datePickerValue.slice(5, 7) : '01';
                      const currentDay = datePickerValue ? datePickerValue.slice(8, 10) : '15';
                      onChange({ ...answers, fechaIngreso: `${yr}-${currentMonth}-${currentDay}` });
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      answers.fechaIngreso?.startsWith(yr)
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Años de experiencia en tu área */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Clock size={18} className="text-blue-500" />
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold font-display">3. ¿Cuántos años de experiencia tienes en tu área?</h4>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                  Obligatoria
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trayectoria total acumulada en tu disciplina o campo profesional.
            </p>
          </div>

          {/* Quick click options */}
          <div className="flex flex-wrap gap-2 pt-1">
            {quickExperienceOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ...answers, aniosExperiencia: opt })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  answers.aniosExperiencia === opt
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="pt-1">
            <input
              id="perfil-anios-experiencia"
              type="text"
              placeholder="O escribe aquí tus años de experiencia (ej. 7 años)"
              value={answers.aniosExperiencia}
              onChange={(e) => onChange({ ...answers, aniosExperiencia: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
