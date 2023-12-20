import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request } from "express";
// import { RefreshTokenGuard } from "../../../guards/refreshToken.guard";
// import { DevicesViewModel } from "../../jwt/infrastructura/models/view.models";
// import { JwtTokensQueryRepository } from "../../jwt/infrastructura/repository/jwt.query.repository";
//commands
//import { DeleteCurrentDeviceCommand } from "../application/use-cases/delete-current-device-use-case";
//import { DeleteDevicesExceptOneCommand } from "../application/use-cases/delete-all-device-use-case";
import { RefreshTokenGuard } from "../../../../../guards/refreshToken.guard";
import { DeviceSessionsQueryRepository } from "../../../../infrstructura/deviceSessions/device-sessions.query.repository";
import { DevicesViewModel } from "../../../../infrstructura/deviceSessions/models/device.models";

@Controller("security/devices")
export class DevicesController {
  constructor(
    // private readonly commandBus: CommandBus,
    private readonly deviceSessionsQueryRepository: DeviceSessionsQueryRepository
  ) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async getDevices(@Req() request: Request): Promise<DevicesViewModel[]> {
    return this.deviceSessionsQueryRepository.getDevicesByUserId(
      request.body.userId
    );
  }

  // @Delete("")
  // @UseGuards(RefreshTokenGuard)
  // @HttpCode(204)
  // async deleteAllDevices(@Req() request: Request): Promise<boolean> {
  //   return this.commandBus.execute(
  //     new DeleteDevicesExceptOneCommand(request.body.deviceId as string)
  //   );
  // }

  // @Delete(":deviceId")
  // @UseGuards(RefreshTokenGuard)
  // @HttpCode(204)
  // async deleteSelectedDevice(
  //   @Req() request: Request,
  //   @Param() params: { deviceId: string }
  // ): Promise<boolean> {
  //   return this.commandBus.execute(
  //     new DeleteCurrentDeviceCommand({
  //       deviceId: params.deviceId,
  //       userId: request.body.userId,
  //     })
  //   );
  // }
}
