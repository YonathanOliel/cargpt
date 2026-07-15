import { Injectable } from '@nestjs/common';
import type {
  DiagnosisRepository,
  DiagnosisSession,
} from '../domain/diagnosis.types';

/** In-memory repository for Sprint 1. Replaced by Postgres repository next. */
@Injectable()
export class InMemoryDiagnosisRepository implements DiagnosisRepository {
  private readonly store = new Map<string, DiagnosisSession>();

  async create(session: DiagnosisSession): Promise<void> {
    this.store.set(session.id, session);
  }

  async findById(id: string): Promise<DiagnosisSession | undefined> {
    return this.store.get(id);
  }

  async update(session: DiagnosisSession): Promise<void> {
    this.store.set(session.id, session);
  }
}
