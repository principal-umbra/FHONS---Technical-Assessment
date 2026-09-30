import React from 'react';
import { UserProfile } from '../../../types';
import DocumentQuestionnaireRunner from '../DocumentQuestionnaireRunner';
import { MATERIAL_GUARDIA, QUESTIONS_GUARDIA } from './data';
import { saveEvaluation } from '../../../lib/firebase';

interface ProcesoGuardiaViewProps {
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

export default function ProcesoGuardiaView({
  profile,
  evaluationId,
  initialAnswers,
  initialStatus,
  initialScore,
  initialSignature,
  initialToken,
  onBackToHub,
  onCompleted
}: ProcesoGuardiaViewProps) {
  const qId = 'proceso_guardia';
  const evalId = evaluationId || `eval_${Date.now()}_guardia`;

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
      'evaluations_proceso_guardia',
      qId,
      token
    );

    if (status === 'completed' && onCompleted) {
      onCompleted();
    }
  };

  return (
    <DocumentQuestionnaireRunner
      material={MATERIAL_GUARDIA}
      questions={QUESTIONS_GUARDIA}
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
