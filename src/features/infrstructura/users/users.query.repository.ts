import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatedUserViewModel, UserViewDTO } from "./models/users.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";

export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // user table
  async getUsers(
    pageParams: PageSizeQueryModel
  ): Promise<PaginationViewModel<CreatedUserViewModel>> {
    // let result = await this.dataSource.query(
    //   `
    // SELECT "Id", "Login", "Password", "Email"
    // FROM public."Users"
    // WHERE "Email" like $1`,
    //   [email]
    // );
    return Paginated.transformPagination<CreatedUserViewModel>(
      {
        ...pageParams,
        totalCount: 0,
      },
      []
    );
  }
}
