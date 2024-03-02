import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entity/users-entity";
import { DeleteResult, Repository } from "typeorm";
import { Registration } from "../../entity/registration-entity";

@Injectable()
export class UsersRepo {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findUserByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ login });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    return this.usersRepository.delete(userId);
  }

  async saveRegistration(registration: Registration): Promise<Registration> {
    return this.registrationRepository.save(registration);
  }

  async deleteRegistration(registration: Registration): Promise<DeleteResult> {
    return this.registrationRepository.delete(registration);
  }
}
