import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  CreateUserEntryDTO,
  RegistrationEntryDTO,
} from "./models/users.models";

export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserByEmail(email: string): Promise<boolean> {
    let result = await this.dataSource.query(
      `
    SELECT "Id", "Login", "Password", "Email"
	  FROM public."Users"
	  WHERE "Email" like $1`,
      [email]
    );

    if (result.length > 0) return true;
    return false;
  }

  async findUserByLogin(login: string): Promise<boolean> {
    let result = await this.dataSource.query(
      `
    SELECT "Id", "Login", "Password", "Email"
	  FROM public."Users"
	  WHERE "Login" like $1`,
      [login]
    );

    if (result.length > 0) return true;
    return false;
  }

  async createUser(creationUser: CreateUserEntryDTO): Promise<{ Id: string }> {
    const { login, passwordHash, email } = creationUser;

    let result = await this.dataSource.query(
      `INSERT INTO public."Users"(
      "Login", "Password", "Email")
      VALUES ($1, $2, $3)
      RETURNING "Id";`,
      [login, passwordHash, email]
    );
    return result[0];
  }

  async registrationUser(
    registrationUser: RegistrationEntryDTO
  ): Promise<boolean> {
    const {
      confirmCode,
      isConfirmed,
      emailExpDate,
      createdAt,
      userId: { Id },
    } = registrationUser;

    return this.dataSource.query(
      `INSERT INTO public."Registration"(
      "ConfirmCode", "IsConfirmed", "EmailExpDate", "CreatedAt", "UserId")
	    VALUES ($1, $2, $3, $4, $5);`,
      [confirmCode, isConfirmed, emailExpDate, createdAt, Id]
    );
  }
}

// Ivan
// blog
//controller
// sa-blogs
// public-blogs
// use-cases

// Akzhan
// roles
//sa -> features -> blogs -> use-cases (DDD)
// -> posts -> use-cases (DDD)

//public -> features -> blogs -> use-cases (DDD)
// -> posts -> use-cases (DDD)

//infro
// blogs
// post

// E2E
// unit

// nest
// typeorm
// postgress (СУБД)
// SQL
