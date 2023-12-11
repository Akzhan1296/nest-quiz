import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDTO } from "../users.dto";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { generateHash } from "../../../../../../utils/passwordHash";
import { CreatedUserViewModel } from "../../../../../infrstructura/users/models/users.models";

export class CreateUserCommand {
  constructor(public createUserDTO: CreateUserDTO) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<CreatedUserViewModel> {
    const { login, password, email } = command.createUserDTO;
    const passwordHash: string = await generateHash(password);
    
    const createdUser = await this.usersRepository.createUser({
      login,
      passwordHash,
      email,
      createdAt: new Date(),
    });

    return createdUser;
  }
}
