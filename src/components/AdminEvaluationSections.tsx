import React from 'react';
import { EvaluationDocument } from '../lib/firebase';
import { QuestionnaireAnswers } from '../types';

interface AdminEvaluationSectionsProps {
  evalDoc: EvaluationDocument;
}

export default function AdminEvaluationSections({ evalDoc }: AdminEvaluationSectionsProps) {
  const { profile, answers } = evalDoc;

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

  const renderSection = (title: string, data: any) => {
    if (!data) return null;
    return (
      <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">{title}</h3>
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

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-mono block">ID: {evalDoc.id}</span>
          <span className="text-xs text-slate-400 block mt-1">Finalizado: {new Date(evalDoc.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {renderSection('Sección 1: Empatía y Escucha Activa', answers.section1)}
        {renderSection('Sección 2: Conocimiento Técnico y Producto', answers.section2)}
        {renderSection('Sección 3: Ownership y Resolución', answers.section3)}
        {renderSection('Sección 4: Manejo de Expectativas y Comunicación', answers.section4)}
        {renderSection('Sección 5: Inteligencia Emocional y Trabajo en Equipo', answers.section5)}
        {renderSection('Sección 6: Filosofía Personal y Compromiso', answers.section6)}
      </div>
    </div>
  );
}