import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { GetRefreshTokenDTO, RefreshTokenResultDTO } from "../auth.dto";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";

export class UpdateUserRefreshTokenCommand {
  constructor(public getRefreshTokenDTO: GetRefreshTokenDTO) {}
}

@CommandHandler(UpdateUserRefreshTokenCommand)
export class UpdateUserRefreshTokenUseCase
  implements ICommandHandler<UpdateUserRefreshTokenCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly deviceSessionRepository: DeviceSessionsRepository
  ) {}

  async execute(
    command: UpdateUserRefreshTokenCommand
  ): Promise<RefreshTokenResultDTO> {
    const { userId, deviceId } = command.getRefreshTokenDTO;
    const createdAtRefreshToken: Date = new Date();

    let authSessionMetaData = null;

    const result: RefreshTokenResultDTO = {
      isUserFound: false,
      accessToken: null,
      refreshToken: null,
    };

    const userData = await this.usersRepository.findUserById(userId);

    if (!userData) return result;

    result.isUserFound = true;

    authSessionMetaData =
      await this.deviceSessionRepository.getAuthMetaDataByDeviceIdAndUserId({
        userId,
        deviceId,
      });

    // if found valid meta data, update it
    if (authSessionMetaData) {
      try {
        await this.deviceSessionRepository.updateAuthMetaData({
          authSessionId: authSessionMetaData.id,
          createdAt: createdAtRefreshToken,
        });
      } catch (err) {
        throw new Error(`Some error while updating meta auth data ${err}`);
      }
    }

    // creating AT
    result.accessToken = await this.authService.createAccessToken({
      userId: userData.id,
      login: userData.login,
      email: userData.email,
    });

    // creating RT
    result.refreshToken = await this.authService.createRefreshToken({
      userId: userData.id,
      login: userData.login,
      email: userData.email,
      deviceIp: authSessionMetaData.deviceIp,
      deviceName: authSessionMetaData.deviceName,
      deviceId: authSessionMetaData.deviceId,
      createdAt: createdAtRefreshToken,
    });

    return result;
  }
}
