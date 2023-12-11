import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
  EmailDataDTO,
  AccessTokenPayloadDTO,
  refreshTokenPayloadDTO,
} from "./auth.dto";
import { emailAdapter } from "../../../../../utils/emailAdapter";
import { UsersRepository } from "../../../../infrstructura/users/users.repository";
import { UserViewDTO } from "../../../../infrstructura/users/models/users.models";
import { settings } from "../../../../../settings";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  async sendEmail(emailDataDTO: EmailDataDTO) {
    const {
      code,
      email,
      letterText,
      letterTitle,
      codeText = "code",
    } = emailDataDTO;
    await emailAdapter.sendEmail(
      email,
      `${letterTitle}`,
      `<a href="http://localhost:5005/?${codeText}=${code}">${letterText}</a>`
    );
  }
  async checkCreds(
    loginOrEmail: string,
    password: string
  ): Promise<UserViewDTO | null> {
    let userData: UserViewDTO | null = null;
    let isPasswordExist: boolean = false;
    userData = await this.usersRepository.findUserByEmail(loginOrEmail);
    if (!userData) {
      userData = await this.usersRepository.findUserByLogin(loginOrEmail);
    }

    if (userData) {
      isPasswordExist = await bcrypt.compare(password, userData.password);
    }

    return isPasswordExist ? userData : null;
  }
  async createAccessToken(
    accessTokenPayload: AccessTokenPayloadDTO
  ): Promise<string> {
    const { userId, login, email } = accessTokenPayload;

    const payload = {
      userId,
      login,
      email,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: settings.JWT_SECRET,
      expiresIn: "10min",
    });
    return accessToken;
  }
  async createRefreshToken(
    refreshTokenPayload: refreshTokenPayloadDTO
  ): Promise<string> {
    const { userId, login, email, deviceName, deviceIp, deviceId } = refreshTokenPayload;

    const payload = {
      userId,
      login,
      email,
      deviceName,
      deviceIp,
      deviceId,
      createdAt: new Date(),
    };
    const refreshsToken = this.jwtService.sign(payload, {
      secret: settings.JWT_SECRET,
      expiresIn: "10min",
    });
    return refreshsToken;
  }
}
