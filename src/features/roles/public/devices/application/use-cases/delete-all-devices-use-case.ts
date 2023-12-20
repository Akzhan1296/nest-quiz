import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteDeviceDTO } from "../devices.dto";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";

export class DeleteDevicesExceptCurrentCommand {
  constructor(public deleteDeviceDTO: DeleteDeviceDTO) {}
}
@CommandHandler(DeleteDevicesExceptCurrentCommand)
export class DeleteDevicesExceptCurrentUseCase
  implements ICommandHandler<DeleteDevicesExceptCurrentCommand>
{
  constructor(
    private readonly deviceSessionRepository: DeviceSessionsRepository
  ) {}
  async execute(command: DeleteDevicesExceptCurrentCommand): Promise<void> {
    return this.deviceSessionRepository.deleteAllAuthMetaDataExceptCurrent(
      command.deleteDeviceDTO
    );
  }
}
