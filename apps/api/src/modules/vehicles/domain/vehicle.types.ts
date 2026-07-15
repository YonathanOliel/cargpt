import type { Vehicle } from '@cargpt/shared';

export interface VehicleEntity extends Vehicle {
  userId: string;
  createdAt: Date;
}

export interface VehicleRepository {
  create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  findByUser(userId: string): Promise<VehicleEntity[]>;
  findByIdForUser(id: string, userId: string): Promise<VehicleEntity | undefined>;
  update(vehicle: VehicleEntity): Promise<VehicleEntity>;
}

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');
