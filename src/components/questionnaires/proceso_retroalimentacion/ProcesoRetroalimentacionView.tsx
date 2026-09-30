import React from 'react';
import { UserProfile } from '../../../types';
import DocumentQuestionnaireRunner from '../DocumentQuestionnaireRunner';
import { MATERIAL_RETROALIMENTACION, QUESTIONS_RETROALIMENTACION } from './data';
import { saveEvaluation } from '../../../lib/firebase';

interface ProcesoRetroalimentacionViewProps {
  profile: UserProfile;
  evaluationId?: string;
  initialAnswers?: any;
  initialStatus?: 'pending' | 'abierto_pendiente' | 'completed';
  initialScore?: number;
  initialSignature?: string;
  initialToken?: string;
  onBackToHub?: () => void;
  onCompleted?: () => void;
}

export default function ProcesoRetroalimentacionView({
  profile,
  evaluationId,
  initialAnswers,
  initialStatus,
  initialScore,
  initialSignature,
  initialToken,
  onBackToHub,
  onCompleted
}: ProcesoRetroalimentacionViewProps) {
  const qId = 'proceso_retroalimentacion';
  const evalId = evaluationId || `eval_${Date.now()}_retro`;

  const handleSaveProgress = async (
    answers: Record<string, string>,
    status: 'abierto_pendiente' | 'completed',
    score: number,
    signature?: string,
    token?: string
  ) => {
    const payload = {
      ...answers,
      scorePercentage: score,
      finalSignature: signature,
      readingConfirmed: true,
      lastUpdated: new Date().toISOString()
    };

    await saveEvaluation(
      evalId,
      { ...profile, ...(signature ? { name: signature } : {}) },
      payload,
      status,
      status === 'completed' ? 'summary' : 'quiz',
      'evaluations_proceso_retroalimentacion',
      qId,
      token
    );

    if (status === 'completed' && onCompleted) {
      onCompleted();
    }
  };

  return (
    <DocumentQuestionnaireRunner
      material={MATERIAL_RETROALIMENTACION}
      questions={QUESTIONS_RETROALIMENTACION}
      questionnaireId={qId}
      profile={profile}
      initialAnswers={initialAnswers}
      initialReadingConfirmed={Boolean(initialAnswers?.readingConfirmed)}
      initialScore={initialScore}
      initialSignature={initialSignature}
      initialStatus={initialStatus}
      initialToken={initialToken}
      onSaveProgress={handleSaveProgress}
      onBackToHub={onBackToHub}
    />
  );
}
