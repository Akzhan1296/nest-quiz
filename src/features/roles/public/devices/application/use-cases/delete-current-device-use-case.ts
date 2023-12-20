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
      canDeleteDevice: false,
      isDeviceDeleted: false,
    };

    // check user
    const user = await this.usersRepository.findUserById(userId);
    if (!user) return result;

    result.isUserFound = true;

    // check device
    const authMetaData =
      await this.deviceSessionRepository.getAuthMetaDataByDeviceIdAndUserId({
        userId,
        deviceId,
      });
    // if user found, however device not found it is a forbidden
    if (!authMetaData) return result;
    result.canDeleteDevice = true;

    // if the first 2 conditions have passed,delete device

    try {
      await this.deviceSessionRepository.deleteAuthMetaData(deviceId);
      result.isDeviceDeleted = true;
    } catch (err) {
      throw new Error(err);
    }

    return result;
  }
}
