import { Injectable } from '@nestjs/common';
import type { User, UserRepository } from '../domain/user.types';

/** In-memory user store for Sprint 1. Replaced by Postgres repository next. */
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly byPhone = new Map<string, User>();

  async findByPhone(phone: string): Promise<User | undefined> {
    return this.byPhone.get(phone);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.byId.get(id);
  }

  async create(user: User): Promise<User> {
    this.byId.set(user.id, user);
    this.byPhone.set(user.phone, user);
    return user;
  }
}
