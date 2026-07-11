/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveStep } from '../../../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface SectionContainerProps {
  currentStep: ActiveStep;
  steps: { id: ActiveStep; label: string }[];
  onBack: () => void;
  onNext: () => void;
  validationError?: string | null;
  children: React.ReactNode;
}

export default function SectionContainer({
  currentStep,
  steps,
  onBack,
  onNext,
  validationError,
  children
}: SectionContainerProps) {
  // Find current step index in Section 1 to 6 list
  const activeStepsOnly = steps.filter((s) => s.id !== 'welcome' && s.id !== 'summary');
  const currentIndex = activeStepsOnly.findIndex((s) => s.id === currentStep);
  const totalSteps = activeStepsOnly.length;

  const progressPercent = ((currentIndex + 1) / totalSteps) * 100;
  const currentStepLabel = activeStepsOnly[currentIndex]?.label || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="section-container">
      {/* Step Progress indicators */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60 space-y-4" id="progress-indicator">
        <div className="flex justify-between items-center text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
              Sección {currentIndex + 1} de {totalSteps}
            </span>
            <span className="font-semibold text-slate-800 font-display text-sm">{currentStepLabel}</span>
          </div>
          <span className="font-mono font-bold text-slate-400">{Math.round(progressPercent)}% Completado</span>
        </div>

        {/* Outer Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full bg-slate-900 rounded-full"
          />
        </div>
      </div>

      {/* Actual Section Interactive Content */}
      <div className="min-h-[400px]" id="section-content-wrapper">
        {children}
      </div>

      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 text-rose-850 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2.5 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* Navigation Buttons footer */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/60" id="section-navigation">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
          id="prev-section-btn"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-slate-900/10 transition flex items-center gap-1.5 transform active:scale-98 cursor-pointer"
          id="next-section-btn"
        >
          {currentIndex === totalSteps - 1 ? (
            <>
              Finalizar Cuestionario
              <Check size={16} />
            </>
          ) : (
            <>
              Siguiente Sección
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
