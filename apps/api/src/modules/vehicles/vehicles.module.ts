import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VEHICLE_REPOSITORY } from './domain/vehicle.types';
import { InMemoryVehicleRepository } from './infrastructure/in-memory-vehicle.repository';

@Module({
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    { provide: VEHICLE_REPOSITORY, useClass: InMemoryVehicleRepository },
  ],
})
export class VehiclesModule {}
