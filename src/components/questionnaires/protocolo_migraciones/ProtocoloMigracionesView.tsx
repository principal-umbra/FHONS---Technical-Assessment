import React from 'react';
import { UserProfile } from '../../../types';
import DocumentQuestionnaireRunner from '../DocumentQuestionnaireRunner';
import { MATERIAL_MIGRACIONES, QUESTIONS_MIGRACIONES } from './data';
import { saveEvaluation } from '../../../lib/firebase';

interface ProtocoloMigracionesViewProps {
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

export default function ProtocoloMigracionesView({
  profile,
  evaluationId,
  initialAnswers,
  initialStatus,
  initialScore,
  initialSignature,
  initialToken,
  onBackToHub,
  onCompleted
}: ProtocoloMigracionesViewProps) {
  const qId = 'protocolo_migraciones';
  const evalId = evaluationId || `eval_${Date.now()}_migraciones`;

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
      'evaluations_protocolo_migraciones',
      qId,
      token
    );

    if (status === 'completed' && onCompleted) {
      onCompleted();
    }
  };

  return (
    <DocumentQuestionnaireRunner
      material={MATERIAL_MIGRACIONES}
      questions={QUESTIONS_MIGRACIONES}
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
