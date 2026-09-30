import React from 'react';
import { UserProfile } from '../../../types';
import DocumentQuestionnaireRunner from '../DocumentQuestionnaireRunner';
import { MATERIAL_VISITAS, QUESTIONS_VISITAS } from './data';
import { saveEvaluation } from '../../../lib/firebase';

interface ProtocoloVisitasViewProps {
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

export default function ProtocoloVisitasView({
  profile,
  evaluationId,
  initialAnswers,
  initialStatus,
  initialScore,
  initialSignature,
  initialToken,
  onBackToHub,
  onCompleted
}: ProtocoloVisitasViewProps) {
  const qId = 'protocolo_visitas';
  const evalId = evaluationId || `eval_${Date.now()}_visitas`;

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
      'evaluations_protocolo_visitas',
      qId,
      token
    );

    if (status === 'completed' && onCompleted) {
      onCompleted();
    }
  };

  return (
    <DocumentQuestionnaireRunner
      material={MATERIAL_VISITAS}
      questions={QUESTIONS_VISITAS}
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
