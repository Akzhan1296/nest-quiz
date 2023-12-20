import { add } from "date-fns";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthService } from "../auth.service";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { v4 as uuidv4 } from "uuid";
import { RecoveryPasswordResultDTO } from "../auth.dto";

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}
@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService
  ) {}

  async execute(
    command: PasswordRecoveryCommand
  ): Promise<RecoveryPasswordResultDTO> {
    const result: RecoveryPasswordResultDTO = {
      isUserFound: false,
      isConfirmDataUpdated: false,
    };

    const userByEmail =
      await this.usersRepository.findUserRegistrationDataByEmail(command.email);

    if (!userByEmail) {
      return result;
    }

    result.isUserFound = true;
    const confirmCode = uuidv4();

    // update confirm data
    try {
      const isConfirmCodeUpdated = await this.usersRepository.setNewConfirmCode(
        {
          confirmCode,
          emailExpDate: add(new Date(), {
            minutes: 10,
          }),
          registrationId: userByEmail.registrationId,
        }
      );
      result.isConfirmDataUpdated = isConfirmCodeUpdated;
    } catch (err) {
      throw new Error(err);
    }

    // send email
    try {
      await this.authService.sendEmail({
        email: command.email,
        code: confirmCode,
        letterTitle: "Password recovery",
        letterText: "Recovery Code",
        // codeText: "recoveryCode",
      });
    } catch (err) {
      throw new Error(err);
    }

    return result;
  }
}
