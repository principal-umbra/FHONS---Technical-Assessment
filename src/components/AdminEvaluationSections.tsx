/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EvaluationDocument } from '../lib/firebase';
import { PerfilProfesionalAnswers } from '../types';
import { Briefcase, Sparkles, Heart, Globe, Lock, Camera, Linkedin, Download, Eye, X } from 'lucide-react';

interface AdminEvaluationSectionsProps {
  evalDoc: EvaluationDocument;
}

export default function AdminEvaluationSections({ evalDoc }: AdminEvaluationSectionsProps) {
  const { profile, answers } = evalDoc;
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  const isPerfil = evalDoc.questionnaireId === 'perfil_profesional' || answers?.cargo !== undefined;

  const renderValue = (value: any) => {
    if (value === undefined || value === null || value === '') return <span className="text-slate-400 italic">No respondido</span>;
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((v, i) => <li key={i}>{v}</li>)}
      </ul>
    );
    if (typeof value === 'object') {
      return (
        <div className="space-y-2 mt-2">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="pl-4 border-l-2 border-slate-200">
              <span className="font-mono text-xs text-slate-500">{k}:</span> {renderValue(v)}
            </div>
          ))}
        </div>
      );
    }
    return <span className="whitespace-pre-wrap">{value}</span>;
  };

  const renderField = (label: string, value: any, note?: string) => (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">{label}</h4>
      <div className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
        {renderValue(value)}
      </div>
      {note && <p className="text-[11px] text-slate-400 pl-1">{note}</p>}
    </div>
  );

  const renderSection = (title: string, data: any) => {
    if (!data) return null;
    return (
      <div className="mb-8 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 font-display">{title}</h3>
        </div>
        <div className="p-6 bg-white space-y-6">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">{key}</h4>
              <div className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">
                {renderValue(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isPerfil) {
    const pAnswers = answers as PerfilProfesionalAnswers;
    const words = pAnswers.tresPalabras?.filter(Boolean) || [];

    return (
      <div className="w-full space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                Perfil Profesional Web
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                {evalDoc.status === 'completed' ? 'Completado' : 'En Progreso'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono block">ID: {evalDoc.id}</span>
            <span className="text-xs text-slate-400 block mt-1">Fecha: {profile.date}</span>
          </div>
        </div>

        {/* Section 1: Trayectoria y Rol en FHONS */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-850">
            <Briefcase size={18} className="text-blue-600" />
            <h3 className="font-bold font-display">1. Trayectoria y Rol en FHONS</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('¿Cuál es tu cargo?', pAnswers.cargo)}
              {renderField('¿Desde cuándo trabajas en FHONS?', pAnswers.fechaIngreso)}
            </div>
            {renderField('¿Cuántos años de experiencia tienes en tu área?', pAnswers.aniosExperiencia)}
            {renderField('¿Qué haces en FHONS? (Funciones y aporte)', pAnswers.queHaces)}
          </div>
        </div>

        {/* Section 2: Especialidades y Logros */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-850">
            <Sparkles size={18} className="text-amber-500" />
            <h3 className="font-bold font-display">2. Especialidades, Estudios y Logros</h3>
          </div>
          <div className="p-6 space-y-5">
            {renderField('Principales habilidades o especialidades', pAnswers.habilidadesEspecialidades)}
            {pAnswers.habilidadesTexto && renderField('Detalles adicionales sobre habilidades', pAnswers.habilidadesTexto)}
            
            {/* Estudios y Certificaciones */}
            {pAnswers.estudiosCertificacionesList && pAnswers.estudiosCertificacionesList.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono block">
                  Estudios y Certificaciones Registradas ({pAnswers.estudiosCertificacionesList.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pAnswers.estudiosCertificacionesList.map((item) => (
                    <div key={item.id} className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                          {item.tipo}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.estado}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{item.titulo}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{item.institucion}</span>
                        {item.anio && <span className="font-mono text-slate-400">{item.anio}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              renderField('Estudios o certificaciones a destacar', pAnswers.estudiosCertificaciones)
            )}

            {/* Logro Profesional */}
            {pAnswers.logroDetallado?.titulo ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono block">
                  Logro Profesional Más Significativo (Detallado)
                </span>
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{pAnswers.logroDetallado.titulo}</span>
                    <div className="flex items-center gap-2">
                      {pAnswers.logroDetallado.categoria && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                          {pAnswers.logroDetallado.categoria}
                        </span>
                      )}
                      {pAnswers.logroDetallado.anio && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {pAnswers.logroDetallado.anio}
                        </span>
                      )}
                    </div>
                  </div>
                  {pAnswers.logroDetallado.descripcion && (
                    <div className="bg-white/70 p-3 rounded-lg border border-emerald-100 text-slate-700 leading-relaxed">
                      <p>{pAnswers.logroDetallado.descripcion}</p>
                    </div>
                  )}
                  {pAnswers.logroDetallado.impacto && (
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                      <span className="font-mono text-[10px] text-emerald-700 font-bold block">IMPACTO / RESULTADO CLAVE:</span>
                      <p className="text-slate-800 font-medium">{pAnswers.logroDetallado.impacto}</p>
                    </div>
                  )}
                  {/* Legacy fields */}
                  {pAnswers.logroDetallado.contextoReto && (
                    <div>
                      <span className="font-mono text-[10px] text-amber-700 font-bold block">1. DESAFÍO / SITUACIÓN:</span>
                      <p className="text-slate-700">{pAnswers.logroDetallado.contextoReto}</p>
                    </div>
                  )}
                  {pAnswers.logroDetallado.accionRealizada && (
                    <div>
                      <span className="font-mono text-[10px] text-blue-700 font-bold block">2. SOLUCIÓN IMPLEMENTADA:</span>
                      <p className="text-slate-700">{pAnswers.logroDetallado.accionRealizada}</p>
                    </div>
                  )}
                  {!pAnswers.logroDetallado.impacto && pAnswers.logroDetallado.impactoResultado && (
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                      <span className="font-mono text-[10px] text-emerald-700 font-bold block">3. IMPACTO O RESULTADO:</span>
                      <p className="text-slate-800 font-medium">{pAnswers.logroDetallado.impactoResultado}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              renderField('Logro profesional que hace sentir orgulloso', pAnswers.logroProfesional)
            )}
          </div>
        </div>

        {/* Section 3: Pasión y Cultura FHONS */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-850">
            <Heart size={18} className="text-rose-500" />
            <h3 className="font-bold font-display">3. Pasión, Cultura y Personalidad</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('¿Qué disfrutas más de tu trabajo?', pAnswers.disfruteTrabajo)}
              {renderField('¿Qué es lo que más te gusta de trabajar en FHONS?', pAnswers.gustoFhons)}
            </div>
            {renderField('¿Cómo te describirías en tres palabras?', words.length > 0 ? words.join(' • ') : '')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('Hobbies o pasatiempos', pAnswers.hobbies)}
              {renderField('Talento poco conocido', pAnswers.talentoOculto)}
            </div>
          </div>
        </div>

        {/* Section 4: Presencia Web y Privacidad */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-850">
            <Globe size={18} className="text-indigo-600" />
            <h3 className="font-bold font-display">4. Presencia Web, Fotografía y Privacidad</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('Anécdota divertida o costumbre graciosa', pAnswers.anecdotaDivertida)}
              {renderField('Tema para hablar durante horas', pAnswers.temaHoras)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('Frase o lema que te representa', pAnswers.fraseLema)}
              {renderField('Perfil de LinkedIn', pAnswers.linkedinUrl)}
            </div>
            {pAnswers.algoMas && renderField('Algo más sobre ti', pAnswers.algoMas)}
            
            {/* Foto details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">
                  Gestión de Fotografía Oficial
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {pAnswers.fotoPreferencia === 'tengo_foto' ? 'Colaborador adjuntó fotografía propia' : 'Requiere coordinar sesión de fotos institucional'}
                </p>
                {pAnswers.fotoUrl && (
                  <p className="text-xs text-emerald-600 font-medium">Foto almacenada y disponible en alta calidad para descarga</p>
                )}
              </div>
              {pAnswers.fotoUrl && (
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setShowFullPhoto(true)}
                    className="relative cursor-pointer group rounded-xl overflow-hidden border-2 border-slate-300 shadow-xs"
                    title="Ver imagen completa"
                  >
                    <img src={pAnswers.fotoUrl} alt={profile.name} className="w-14 h-14 object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                      <Eye size={16} />
                    </div>
                  </div>

                  <a
                    href={pAnswers.fotoUrl}
                    download={`foto_perfil_${profile.name.replace(/\s+/g, '_').toLowerCase()}.jpg`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download size={14} />
                    Descargar Foto
                  </a>
                </div>
              )}
            </div>

            {/* Modal de foto en tamaño completo */}
            {showFullPhoto && pAnswers.fotoUrl && (
              <div 
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => setShowFullPhoto(false)}
              >
                <div 
                  className="bg-white rounded-3xl overflow-hidden max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 font-display">Fotografía Oficial</h4>
                      <p className="text-xs text-slate-500">{profile.name} — {pAnswers.cargo || 'Colaborador FHONS'}</p>
                    </div>
                    <button 
                      onClick={() => setShowFullPhoto(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-[60vh]">
                    <img 
                      src={pAnswers.fotoUrl} 
                      alt={profile.name} 
                      className="w-full h-full object-contain max-h-[60vh]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFullPhoto(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                    >
                      Cerrar
                    </button>
                    <a
                      href={pAnswers.fotoUrl}
                      download={`foto_perfil_${profile.name.replace(/\s+/g, '_').toLowerCase()}.jpg`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <Download size={14} />
                      Descargar JPG
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy restrictions */}
            {pAnswers.restriccionesPrivacidad && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <Lock size={14} />
                  <span>RESTRICCIONES DE PRIVACIDAD SOLICITADAS POR EL COLABORADOR:</span>
                </div>
                <p className="text-sm text-amber-950">{pAnswers.restriccionesPrivacidad}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-mono block">ID: {evalDoc.id}</span>
          <span className="text-xs text-slate-400 block mt-1">Finalizado: {new Date(evalDoc.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {renderSection('Sección 1: Empatía y Escucha Activa', answers?.section1)}
        {renderSection('Sección 2: Conocimiento Técnico y Producto', answers?.section2)}
        {renderSection('Sección 3: Ownership y Resolución', answers?.section3)}
        {renderSection('Sección 4: Manejo de Expectativas y Comunicación', answers?.section4)}
        {renderSection('Sección 5: Inteligencia Emocional y Trabajo en Equipo', answers?.section5)}
        {renderSection('Sección 6: Filosofía Personal y Compromiso', answers?.section6)}
      </div>
    </div>
  );
}
