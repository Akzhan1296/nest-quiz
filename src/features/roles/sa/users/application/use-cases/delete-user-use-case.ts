import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { DeleteUserResultDTO } from "../users.dto";

export class DeleteUserCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserResultDTO> {
    const result: DeleteUserResultDTO = {
      isUserFound: false,
      isUserDeleted: false,
      isUserHaveRegistrationData: false,
      IsRegistrationDataDeleted: false,
    };

    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) return result;

    result.isUserFound = true;
    const registrationId =
      await this.usersRepository.findRegistrationDataByUserId(user.id);

    // delete registration first user id is refered
    if (registrationId) {
      result.isUserHaveRegistrationData = true;
      try {
        await this.usersRepository.deleteRegistration(registrationId);
        const registrationData =
          await this.usersRepository.findRegistrationDataByUserId(user.id);
        result.IsRegistrationDataDeleted = !registrationData;
      } catch (err) {
        throw new Error(`Failed to delete registration data: ${err.message}`);
      }
    }

    // delete user
    try {
      await this.usersRepository.deleteUser(user.id);
      const userData = await this.usersRepository.findUserById(command.userId);
      result.isUserDeleted = !userData;
    } catch (err) {
      throw new Error(`Failed to delete user: ${err.message}`);
    }
    return result;
  }
}
