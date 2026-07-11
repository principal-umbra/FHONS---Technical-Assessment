import React from 'react';
import { FlaskConical, Info, BrainCircuit } from 'lucide-react';

export default function AdminLaboratory() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 text-slate-400 space-y-4 p-8 text-center">
      <div className="p-4 bg-slate-100 rounded-full relative">
        <FlaskConical size={48} className="text-slate-300" />
        <div className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-sm">
          <BrainCircuit size={20} className="text-indigo-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-700">Laboratorio de Análisis Integral</h3>
      <p className="max-w-xl text-sm leading-relaxed">
        Centro de evaluación profunda. Aquí se analizarán las respuestas del agente en múltiples cuestionarios para extraer una visión compuesta (social, laboral, neural y psicológica) utilizando inteligencia artificial y análisis semántico.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-6 text-left">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Perfil Psicológico</h4>
          <p className="text-xs text-slate-500">Evaluación de empatía y manejo de crisis.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Perfil Social/Laboral</h4>
          <p className="text-xs text-slate-500">Integración con el equipo y ownership.</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 bg-indigo-50 text-indigo-700 p-4 rounded-xl text-xs text-left max-w-2xl">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>Próximamente: Integración con Gemini AI para procesar el lenguaje natural de las respuestas y generar un mapa neuro-profesional de cada agente.</p>
      </div>
    </div>
  );
}