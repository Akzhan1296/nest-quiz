import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthDTO, AutoResultDTO } from "../auth.dto";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { v4 as uuidv4 } from "uuid";

export class LoginCommand {
  constructor(public authDTO: AuthDTO) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceSessionRepository: DeviceSessionsRepository
  ) {}

  async execute(command: LoginCommand): Promise<AutoResultDTO> {
    const createdAtRefreshToken: Date = new Date();

    let authSessionMetaData = null;
    let deviceId = uuidv4();

    let result: AutoResultDTO = {
      accessToken: null,
      refreshToken: null,
      isCorrectPassword: false,
      isUserAlreadyHasAuthSession: false,
    };

    const { deviceName, deviceIp, password, loginOrEmail } = command.authDTO;
    const userData = await this.authService.checkCreds(loginOrEmail, password);

    if (!userData) return result;

    //if user found and correct password
    if (userData) result.isCorrectPassword = true;

    // try to find auth meta data in DB, if we have meta data in DB
    // update createdAt field
    authSessionMetaData =
      await this.deviceSessionRepository.getAuthMetaDataByDeviceNameAndUserId({
        userId: userData.id,
        deviceName,
      });

    // update auth meta data if user already has it
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

    // save auth meta data for future refresh token
    if (!authSessionMetaData) {
      try {
        await this.deviceSessionRepository.createAuthMetaData({
          email: userData.email,
          login: userData.login,
          userId: userData.id,
          createdAt: createdAtRefreshToken,
          deviceIp,
          deviceId,
          deviceName,
        });
      } catch (err) {
        throw new Error(`Some error while saving meta auth data ${err}`);
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
      createdAt: createdAtRefreshToken,
      deviceId: authSessionMetaData ? authSessionMetaData.deviceId : deviceId,
      deviceIp,
      deviceName,
    });

    return result;
  }
}
