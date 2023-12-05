import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
// guards
//   import { AuthBasicGuard } from '../../../guards/authBasic.guard';
// commands
import { CreateUserCommand } from "../application/use-cases/create-user-use-case";
//   import { DeleteUserCommand } from '../application/use-cases/delete-user-use-case';
// models
//   import { PaginationViewModel } from '../../../common/common-types';
import { AddUserInputModel } from "./sa.users.models";
import { CreatedUserViewModel } from "../../../../infrstructura/users/models/users.models";
//   import {
//     AddUserInputModel,
//     BanUserInputModal,
//     UsersQueryType,
//   } from './models/users.models';
// repo
//   import { UsersQueryRepository } from '../infrastructure/repository/users.query.repository';
//   import { BanUserCommand } from '../application/use-cases/ban-unban-use-case';

@Controller("sa/users")
//   @UseGuards(AuthBasicGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus //   private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  // @Get()
  // async getUsers(
  //   @Query() pageSize: UsersQueryType,
  // ): Promise<PaginationViewModel<UserViewModel>> {
  //   return await this.usersQueryRepository.getUsers(pageSize);
  // }

  // create user
  @Post()
  @HttpCode(201)
  async createUser(
    @Body() inputModel: AddUserInputModel
  ): Promise<CreatedUserViewModel> {
    const user = await this.commandBus.execute(
      new CreateUserCommand({
        login: inputModel.login,
        email: inputModel.email,
        password: inputModel.password,
      })
    );
    return user;
  }

  // //ban user
  // @Put(':userId/ban')
  // @HttpCode(204)
  // async banUser(
  //   @Param() params: { userId: string },
  //   @Body() inputModel: BanUserInputModal,
  // ) {
  //   const user = await this.commandBus.execute(
  //     new BanUserCommand({
  //       ...inputModel,
  //       userId: params.userId,
  //     }),
  //   );
  //   return await this.usersQueryRepository.findUserById(user._id.toString());
  // }

  // delete user
  // @Delete(':id')
  // @HttpCode(204)
  // async deleteUser(@Param() params: { id: string }): Promise<boolean> {
  //   return await this.commandBus.execute(new DeleteUserCommand(params.id));
  // }
}
