import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AuthMetaDataEntryDTO } from "./models/device.models";

export class DeviceSessionsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAuthMetaDataByDeviceNameAndUserId(
    userId: string,
    deviceName: string
  ) {}
  async updateAuthMetaData() {}
  async createAuthMetaData(authMetaData: AuthMetaDataEntryDTO) {
    const { email, login, deviceId, deviceIp, deviceName, createdAt, userId } =
      authMetaData;

    await this.dataSource.query(
      `INSERT INTO public."AuthSessionsMetaData"(
        "Email", "Login", "DeviceIp", "DeviceId", "DeviceName", "CreatedAt", "UserId")
        VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [email, login, deviceIp, deviceId, deviceName, createdAt, userId]
    );
  }
}
