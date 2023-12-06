import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { DeleteUserUseCase } from "./delete-user-use-case";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { UserViewDTO } from "../../../../../infrstructura/users/models/users.models";

describe("Delete user use case", () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let usersRepository: UsersRepository;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    deleteUserUseCase = app.get<DeleteUserUseCase>(DeleteUserUseCase);
    usersRepository = app.get<UsersRepository>(UsersRepository);
  });

  it("Should be defined", () => {
    expect(deleteUserUseCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should delete user", async () => {
    const mockDeleteUserId = "1b6884e3-43cb-49c6-a796-c34ea6c96ec0";
    const mockUser = { id: mockDeleteUserId };
    const mockRegistrationId = "7d41fc88-7f38-4f5f-97fb-5cac9c05253c";
    
    // Mock repository methods
    jest
      .spyOn(usersRepository, "findUserById")
      .mockImplementation(async () => mockUser as UserViewDTO);
    jest
      .spyOn(usersRepository, "findRegistrationDataByUserId")
      .mockImplementation(async () => mockRegistrationId);

    jest
      .spyOn(usersRepository, "deleteRegistration")
      .mockImplementation(async () => {});
    jest
      .spyOn(usersRepository, "deleteUser")
      .mockImplementation(async () => {});

    await deleteUserUseCase.execute({
      userId: mockDeleteUserId,
    });

    // Verify repository method calls
    expect(usersRepository.findUserById).toHaveBeenCalledWith(mockDeleteUserId);
    expect(usersRepository.findRegistrationDataByUserId).toHaveBeenCalledWith(
      mockUser.id
    );
    expect(usersRepository.deleteRegistration).toHaveBeenCalledWith(
      mockRegistrationId
    );
    expect(usersRepository.deleteUser).toHaveBeenCalledWith(mockUser.id);
  });
});
