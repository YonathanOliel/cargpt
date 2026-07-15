import { Injectable } from '@nestjs/common';
import type { VehicleEntity, VehicleRepository } from '../domain/vehicle.types';

/** In-memory vehicle store for Sprint 1. Replaced by Postgres repository next. */
@Injectable()
export class InMemoryVehicleRepository implements VehicleRepository {
  private readonly store = new Map<string, VehicleEntity>();

  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    this.store.set(vehicle.id, vehicle);
    return vehicle;
  }

  async findByUser(userId: string): Promise<VehicleEntity[]> {
    return [...this.store.values()].filter((v) => v.userId === userId);
  }

  async findByIdForUser(id: string, userId: string): Promise<VehicleEntity | undefined> {
    const vehicle = this.store.get(id);
    return vehicle && vehicle.userId === userId ? vehicle : undefined;
  }

  async update(vehicle: VehicleEntity): Promise<VehicleEntity> {
    this.store.set(vehicle.id, vehicle);
    return vehicle;
  }
}
