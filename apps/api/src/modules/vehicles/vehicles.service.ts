import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  VEHICLE_REPOSITORY,
  type VehicleEntity,
  type VehicleRepository,
} from './domain/vehicle.types';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly repo: VehicleRepository,
  ) {}

  create(userId: string, dto: CreateVehicleDto): Promise<VehicleEntity> {
    return this.repo.create({
      id: randomUUID(),
      userId,
      make: dto.make,
      model: dto.model,
      year: dto.year,
      engine: dto.engine,
      mileage: dto.mileage,
      createdAt: new Date(),
    });
  }

  list(userId: string): Promise<VehicleEntity[]> {
    return this.repo.findByUser(userId);
  }

  async update(userId: string, id: string, dto: UpdateVehicleDto): Promise<VehicleEntity> {
    const vehicle = await this.getOrThrow(userId, id);
    return this.repo.update({ ...vehicle, ...dto });
  }

  async history(userId: string, id: string): Promise<{ vehicleId: string; records: [] }> {
    await this.getOrThrow(userId, id);
    // Placeholder until maintenance history is implemented (EPIC E).
    return { vehicleId: id, records: [] };
  }

  private async getOrThrow(userId: string, id: string): Promise<VehicleEntity> {
    const vehicle = await this.repo.findByIdForUser(id, userId);
    if (!vehicle) throw new NotFoundException('רכב לא נמצא');
    return vehicle;
  }
}
