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

  it('Should be defined', () => {
    expect(createUserUseCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  })
  it("Should create user", async () => {
    const createUserDTO = {
      login: "123",
      password: "123",
      email: "132",
    };

    const createdUserMock = {
      login: "123",
      id: "88ab75aa-523e-4eb8-a288-c8f7c2329813",
      email: "132",
      createdAt: new Date(),
    };

    jest
      .spyOn(usersRepository, "createUser")
      .mockImplementation(async () => createdUserMock);

    const result = await createUserUseCase.execute({ createUserDTO });
    expect(result).toEqual(createdUserMock);
  });
});
