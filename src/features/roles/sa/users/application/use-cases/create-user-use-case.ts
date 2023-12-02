import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDTO } from "../users.dto";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { generateHash } from "../../../../../../utils/passwordHash";

export class CreateUserCommand {
  constructor(public createUserDTO: CreateUserDTO) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand) {
    const { login, password, email } = command.createUserDTO;
    const passwordHash:string = await generateHash(password);

    const userId = this.usersRepository.createUser({
      login,
      passwordHash,
      email,
    });

    return userId;
  }
}
