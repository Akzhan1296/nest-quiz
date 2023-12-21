import { add } from "date-fns";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthService } from "../auth.service";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { v4 as uuidv4 } from "uuid";
import { RegistrationEmailResendingResultDTO } from "../auth.dto";

export class EmailResendingCommand {
  constructor(public email: string) {}
}
@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase
  implements ICommandHandler<EmailResendingCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService
  ) {}

  async execute(
    command: EmailResendingCommand
  ): Promise<RegistrationEmailResendingResultDTO> {
    const { email } = command;

    const result: RegistrationEmailResendingResultDTO = {
      isUserFound: false,
      isEmailResent: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDataUpdated: false,
    };

    const userByEmail =
      await this.usersRepository.findUserRegistrationDataByEmail(email);

    // check user
    if (userByEmail) {
      result.isUserFound = true;
    } else {
      return result;
    }

    // check is confirmed
    if (userByEmail && userByEmail.isConfirmed) {
      result.isEmailAlreadyConfirmed = true;
      return result;
    }

    const confirmCode = uuidv4();
    // update confirm data
    try {
      const isConfirmCodeUpdated = await this.usersRepository.setNewConfirmCode(
        {
          confirmCode,
          emailExpDate: add(new Date(), {
            minutes: 100,
          }),
          registrationId: userByEmail.registrationId,
        }
      );
      result.isConfirmDataUpdated = isConfirmCodeUpdated;
    } catch (err) {
      throw new Error(err);
    }

    // send new confirm code is confirm data was updated
    if (result.isConfirmDataUpdated) {
      try {
        await this.authService.sendEmail({
          email: email,
          code: confirmCode,
          letterTitle: "Registration",
          letterText: "Confirm new code",
          codeText: "code",
        });
        result.isEmailResent = true;
      } catch (err) {
        throw new Error(err);
      }
    }
    return result;
  }
}
