import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NewPasswordDTO, NewPasswordResultDTO } from "../auth.dto";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { generateHash } from "../../../../../../utils/passwordHash";

export class NewPasswordCommand {
  constructor(public newPasswordDTO: NewPasswordDTO) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: NewPasswordCommand): Promise<NewPasswordResultDTO> {
    const result: NewPasswordResultDTO = {
      isRegistrationDataFound: false,
      isCorrectRecoveryCode: false,
      isPasswordUpdated: false,
    };

    const { recoveryCode, newPassword } = command.newPasswordDTO;

    const registrationData =
      await this.usersRepository.findRegistrationDataByConfirmCode(
        recoveryCode
      );

    if (!registrationData) return result;

    result.isRegistrationDataFound = true;

    const { confirmCode, emailExpDate, userId } = registrationData;

    if (confirmCode === recoveryCode && emailExpDate > new Date()) {
      const passwordHash: string = await generateHash(newPassword);
      result.isPasswordUpdated = await this.usersRepository.setNewPassword({
        userId,
        passwordHash,
      });
      result.isCorrectRecoveryCode = true;
    }

    return result;
  }
}
