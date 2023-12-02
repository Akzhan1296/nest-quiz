import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { CreateUserUseCase } from "./create-user-use-case";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";

describe("Create user use case", () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepository: UsersRepository;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    usersRepository = app.get<UsersRepository>(UsersRepository);
  });
  it("Should create user", async() => {
    const createUserDTO = {
      login: "123",
      password: "123",
      email: "132",
    };

    await createUserUseCase.execute({createUserDTO})  
    const result = await usersRepository.findUserByEmail(createUserDTO.email);
    expect(result).toBe(true);
    
  });
});
