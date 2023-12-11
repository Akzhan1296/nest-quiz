import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthDTO, AutoResultDTO } from "../auth.dto";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { v4 as uuidv4 } from "uuid";

//command
// import { UpdateUserRefreshTokenCommand } from './update-refresh-token-use-case';

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
    let authSessionMetaData = null;
    let deviceId = null;

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
      await this.deviceSessionRepository.getAuthMetaDataByDeviceNameAndUserId(
        deviceName,
        userData.id
      );

    // update refresh token if user already logined
    if (authSessionMetaData) {
      result.isUserAlreadyHasAuthSession = true;
      //   return this.commandBus.execute(
      //     new UpdateUserRefreshTokenCommand({
      //       userId: user._id.toString(),
      //       deviceId: refreshToken.getDeviceId(),
      //     }),
      //   );
    }

    if (!authSessionMetaData) {
      deviceId = uuidv4();
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
      deviceIp,
      deviceName,
      deviceId,
    });

    try {
      await this.deviceSessionRepository.createAuthMetaData({
        email: userData.email,
        login: userData.login,
        userId: userData.id,
        createdAt: new Date(),
        deviceIp,
        deviceId,
        deviceName,
      });
    } catch (err) {
      throw new Error(`Some error while saving meta auth data ${err}`);
    }

    return result;
  }
}
