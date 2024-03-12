import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthSession } from "../../entity/auth-session-entity";

@Injectable()
export class DeviceSessionRepo {
  constructor(
    @InjectRepository(AuthSession)
    private deviceSessionRepository: Repository<AuthSession>
  ) {}

  async getAuthMetaDataByDeviceIdAndUserId(dto: {
    userId: string;
    deviceId: string;
  }) {
    const { userId, deviceId } = dto;

    return this.deviceSessionRepository
      .createQueryBuilder("d")
      .select()
      .where("d.userId = :userId", { userId })
      .andWhere("d.deviceId = :deviceId", { deviceId })
      .getOne();
  }

  async getAuthMetaDataByDeviceNameAndUserId(dto: {
    userId: string;
    deviceName: string;
  }) {
    const { userId, deviceName } = dto;

    return this.deviceSessionRepository
      .createQueryBuilder("d")
      .select()
      .where("d.userId = :userId", { userId })
      .andWhere("d.deviceName = :deviceName", { deviceName })
      .getOne();
  }

  async getAuthMetaDataByDeviceId(dto: { deviceId: string }) {
    return this.deviceSessionRepository.findOneBy({ deviceId: dto.deviceId });
  }

  async saveAuthMetaData(authMetaData: AuthSession) {
    return this.deviceSessionRepository.save(authMetaData);
  }

  async deleteAuthMetaData(deviceId: string) {
    console.log(deviceId)
    return this.deviceSessionRepository.delete(deviceId);
  }
}
