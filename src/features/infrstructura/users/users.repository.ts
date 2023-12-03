import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import {
  ConfirmRegistrationEntryDTO,
  CreateUserEntryDTO,
  NewConfirmCodeEntryDTO,
  RegistrationEntryDTO,
  RegistrationViewDTO,
  RegistrationWithUserViewDTO,
  UserViewDTO,
} from "./models/users.models";

export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserByEmail(email: string): Promise<UserViewDTO | null> {
    // Users table
    let result = await this.dataSource.query(
      `
    SELECT "Id", "Login", "Password", "Email"
	  FROM public."Users"
	  WHERE "Email" like $1`,
      [email]
    );

    if (result.length === 0) return null;
    return {
      id: result[0].Id,
      login: result[0].Login,
      password: result[0].Password,
      email: result[0].Email,
    };
  }

  async findUserByLogin(login: string): Promise<UserViewDTO | null> {
    // Users table
    let result = await this.dataSource.query(
      `
    SELECT "Id", "Login", "Password", "Email"
	  FROM public."Users"
	  WHERE "Login" like $1`,
      [login]
    );

    if (result.length === 0) return null;
    return {
      id: result[0].Id,
      login: result[0].Login,
      password: result[0].Password,
      email: result[0].Email,
    };
  }

  async findUserByConfirmCode(
    code: string
  ): Promise<RegistrationViewDTO | null> {
    // registration table
    let result = await this.dataSource.query(
      ` SELECT "Id", "ConfirmCode", "IsConfirmed", "EmailExpDate", "CreatedAt", "UserId"
	      FROM public."Registration"
	      WHERE "ConfirmCode" like $1`,
      [code]
    );

    if (result.length === 0) return null;

    return {
      createdAt: result[0].CreatedAt,
      emailExpDate: result[0].EmailExpDate,
      isConfirmed: result[0].IsConfirmed,
      confirmCode: result[0].ConfirmCode,
      registrationId: result[0].Id,
    };
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

    const result = await this.dataSource.query(
      `INSERT INTO public."Registration"(
      "ConfirmCode", "IsConfirmed", "EmailExpDate", "CreatedAt", "UserId")
	    VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id"`,
      [confirmCode, isConfirmed, emailExpDate, createdAt, Id]
    );

    return result[0];
  }

  async confirmRegistration(
    registrationConfirmation: ConfirmRegistrationEntryDTO
  ): Promise<boolean> {
    const { confirmCode, isConfirmed } = registrationConfirmation;

    let result = await this.dataSource.query(
      `UPDATE public."Registration"
        SET "IsConfirmed"= $2
        WHERE "ConfirmCode" = $1`,
      [confirmCode, isConfirmed]
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async findUserRegistrationDataByEmail(
    email: string
  ): Promise<RegistrationWithUserViewDTO> {
    const result = await this.dataSource.query(
      ` SELECT r.*, u."Email"
	      FROM public."Registration" r
	      LEFT JOIN public."Users" u
	      on r."UserId" = u."Id"
        WHERE u."Email" = $1`,
      [email]
    );

    if (result.length === 0) return null;

    return {
      registrationId: result[0].Id,
      confirmCode: result[0].ConfirmCode,
      isConfirmed: result[0].IsConfirmed,
      emailExpDate: result[0].EmailExpDate,
      createdAt: result[0].CreatedAt,
      userId: result[0].UserId,
      email: result[0].Email,
    };
  }

  async setNewConfirmCode(newConfirmCode: NewConfirmCodeEntryDTO): Promise<boolean> {
    const { confirmCode, emailExpDate, registrationId } = newConfirmCode;

    let result = await this.dataSource.query(
      `UPDATE public."Registration"
        SET "ConfirmCode"= $1, "EmailExpDate"= $2
        WHERE "Id" = $3`,
      [confirmCode, emailExpDate, registrationId]
    );
    // result = [[], 1 | 0]
    return !!result[1];
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
