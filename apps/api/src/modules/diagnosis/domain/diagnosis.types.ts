import type {
  DiagnosisResult,
  FollowUpAnswer,
  StartDiagnosisResponse,
  Vehicle,
} from '@cargpt/shared';

/** Persisted diagnosis session (in-memory for Sprint 1). */
export interface DiagnosisSession {
  id: string;
  vehicle: Vehicle;
  complaint: string;
  answers: FollowUpAnswer[];
  result?: DiagnosisResult;
  createdAt: Date;
}

export interface DiagnosisRepository {
  create(session: DiagnosisSession): Promise<void>;
  findById(id: string): Promise<DiagnosisSession | undefined>;
  update(session: DiagnosisSession): Promise<void>;
}

export const DIAGNOSIS_REPOSITORY = Symbol('DIAGNOSIS_REPOSITORY');

export type { StartDiagnosisResponse };
