import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import {
  RegistrationConfirmationDTO,
  RegistrationConfirmationResultDTO,
} from "../auth.dto";

export class RegistrationConfirmationCommand {
  constructor(public confirmCode: RegistrationConfirmationDTO) {}
}
@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    command: RegistrationConfirmationCommand
  ): Promise<RegistrationConfirmationResultDTO> {
    const { code } = command.confirmCode;

    const result: RegistrationConfirmationResultDTO = {
      isUserByConfirmCodeFound: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: false,
    };

    // get user by confirm code
    const userByConfirmCode =
      await this.usersRepository.findUserByConfirmCode(code);

    // check is user found
    if (userByConfirmCode) {
      result.isUserByConfirmCodeFound = true;
    } else {
      return result;
    }

    // check is confirmed
    if (userByConfirmCode && userByConfirmCode.isConfirmed) {
      result.isEmailAlreadyConfirmed = true;
      return result;
    }

    // check is isConfirmDateExpired
    if (userByConfirmCode && userByConfirmCode.emailExpDate < new Date()) {
      result.isConfirmDateExpired = true;
      return result;
    }

    try {
      const isRegistrationConfirmed =
        await this.usersRepository.confirmRegistration({
          confirmCode: userByConfirmCode.confirmCode,
          isConfirmed: true,
        });
      result.isRegistrationConfirmed = isRegistrationConfirmed;
    } catch (err) {
      throw new Error(err);
    }
    return result;
  }
}
