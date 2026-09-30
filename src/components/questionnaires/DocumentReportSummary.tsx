import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Calendar, 
  Clock, 
  Printer, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  User,
  Key
} from 'lucide-react';
import { EvaluationDocument } from '../../lib/firebase';
import { DEFAULT_QUESTIONNAIRES } from '../../lib/firebase';

interface DocumentReportSummaryProps {
  evalDoc: EvaluationDocument;
  onBack?: () => void;
  readOnly?: boolean;
}

export default function DocumentReportSummary({
  evalDoc,
  onBack,
  readOnly = false
}: DocumentReportSummaryProps) {
  const qId = evalDoc.questionnaireId || '';
  const qMeta = DEFAULT_QUESTIONNAIRES.find(q => q.id === qId);
  const title = qMeta?.title || 'Evaluación Normativa y Operativa FHONS';
  const score = evalDoc.answers?.scorePercentage !== undefined 
    ? evalDoc.answers.scorePercentage 
    : (evalDoc.status === 'completed' ? 100 : 0);
  const signature = evalDoc.answers?.finalSignature || evalDoc.profile?.name || 'Agente FHONS';
  const token = evalDoc.editToken || evalDoc.answers?.editToken || evalDoc.profile?.editToken || 'FH-PENDING';
  const isPassed = score >= 95;

  return (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Volver</span>
        </button>
      )}

      {/* Official Certificate Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-xl space-y-8 relative overflow-hidden">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Certificación y Constancia Oficial
              </span>
              <h2 className="text-xl font-bold font-display text-slate-900">
                FHONS SRL
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Token de Validación</span>
            <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1.5">
              <Key size={13} className="text-amber-600" />
              {token}
            </span>
          </div>
        </div>

        {/* Status & Title */}
        <div className="space-y-4 text-center max-w-xl mx-auto py-2">
          <span className={`text-xs uppercase font-mono tracking-widest font-bold px-3.5 py-1 rounded-full border inline-block ${
            isPassed 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {isPassed ? `✓ Certificación Aprobada (${score}%)` : `Estado: Abierto Pendiente (${score}%)`}
          </span>

          <h3 className="text-2xl font-bold font-display text-slate-900">
            {title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Constancia oficial de lectura, evaluación y firma del documento normativo por parte del colaborador <strong>{signature}</strong> ({evalDoc.profile?.email}).
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 bg-slate-50/70 p-5 rounded-2xl text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Agente Evaluado</span>
            <span className="font-bold text-slate-900 truncate block">{signature}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Correo Corporativo</span>
            <span className="font-bold text-slate-800 truncate block">{evalDoc.profile?.email}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Puntuación</span>
            <span className={`font-bold ${isPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
              {score}% {isPassed ? '✓ Aprobado' : '⏳ Pendiente'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Fecha de Registro</span>
            <span className="font-bold text-slate-800">
              {evalDoc.updatedAt ? new Date(evalDoc.updatedAt).toLocaleDateString('es-DO', {
                day: '2-digit', month: 'short', year: 'numeric'
              }) : '—'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-mono">
            Documento registrado en Firestore ({evalDoc.id})
          </span>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            <span>Imprimir Constancia</span>
          </button>
        </div>
      </div>
    </div>
  );
}
