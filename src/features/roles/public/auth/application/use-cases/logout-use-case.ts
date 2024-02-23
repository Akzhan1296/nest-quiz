import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { LogOutDTO, LogOutResultDTO } from "../auth.dto";

export class LogOutCommand {
  constructor(public logOutDTO: LogOutDTO) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase implements ICommandHandler<LogOutCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly deviceSessionRepository: DeviceSessionsRepository
  ) {}

  async execute(command: LogOutCommand): Promise<LogOutResultDTO> {
    const { userId, deviceId } = command.logOutDTO;

    const result: LogOutResultDTO = {
      isDeleted: false,
      isForbidden: false,
    };

    // try to find user in DB
    const user = await this.usersRepository.findUserById(userId);
    if (!user) return result;

    // try to find auth meta data in DB
    const device =
      await this.deviceSessionRepository.getAuthMetaDataByDeviceIdAndUserId({
        deviceId,
        userId,
      });
    if (!device) return result;

    // if user and auth meta data were found, delete auth meta data
    try {
      await this.deviceSessionRepository.deleteAuthMetaData(deviceId);
      const authMetaData =
        await this.deviceSessionRepository.getAuthMetaDataByDeviceIdAndUserId({
          deviceId,
          userId,
        });
      result.isDeleted = !authMetaData;
    } catch (err) {
      throw new Error(`Failed to delete auth meta data: ${err.message}`);
    }

    return result;
  }
}
