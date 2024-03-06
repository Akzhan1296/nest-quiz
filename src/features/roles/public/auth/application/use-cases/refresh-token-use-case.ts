import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetRefreshTokenDTO, RefreshTokenResultDTO } from "../auth.dto";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";

export class UpdateUserRefreshTokenCommand {
  constructor(public getRefreshTokenDTO: GetRefreshTokenDTO) {}
}

@CommandHandler(UpdateUserRefreshTokenCommand)
export class UpdateUserRefreshTokenUseCase
  implements ICommandHandler<UpdateUserRefreshTokenCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepo,
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
      isUserAlreadyHasAuthSession: false,
      accessToken: null,
      refreshToken: null,
    };

    const userData = await this.usersRepository.findUserById(userId);

    // return result, if user not found
    if (!userData) return result;

    result.isUserFound = true;

    authSessionMetaData =
      await this.deviceSessionRepository.getAuthMetaDataByDeviceIdAndUserId({
        userId,
        deviceId,
      });

    // return result, if no authSessionMetaData
    if (!authSessionMetaData) return result;

    // if found valid meta data, update it
    if (authSessionMetaData) {
      result.isUserAlreadyHasAuthSession = true;
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
