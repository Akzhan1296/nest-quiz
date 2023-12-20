// import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteDeviceDTO, DeleteDeviceResultDTO } from "../devices.dto";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";

export class DeleteCurrentDeviceCommand {
  constructor(public deleteDeviceDTO: DeleteDeviceDTO) {}
}

@CommandHandler(DeleteCurrentDeviceCommand)
export class DeleteCurrentDeviceUseCase
  implements ICommandHandler<DeleteCurrentDeviceCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly deviceSessionRepository: DeviceSessionsRepository
  ) {}

  async execute(
    command: DeleteCurrentDeviceCommand
  ): Promise<DeleteDeviceResultDTO> {
    const { userId, deviceId } = command.deleteDeviceDTO;

    const result: DeleteDeviceResultDTO = {
      isUserFound: false,
      isDeviceFound: false,
      canDeleteDevice: false,
      isDeviceDeleted: false,
    };

    // check user
    const user = await this.usersRepository.findUserById(userId);
    if (!user) return result;

    result.isUserFound = true;

    // check device in DB
    const deviceData =
      await this.deviceSessionRepository.getAuthMetaDataByDeviceId({
        deviceId,
      });

    if (!deviceData) return result;
    result.isDeviceFound = true;

    if (user.id !== deviceData.userId) {
      return result;
    }
    result.canDeleteDevice = true;

    try {
      await this.deviceSessionRepository.deleteAuthMetaData(deviceId);
      result.isDeviceDeleted = true;
    } catch (err) {
      throw new Error(err);
    }

    return result;
  }
}
