import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatedUserViewModel, UserViewDTO } from "./models/users.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";

export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // user table
  async getUsers(
    pageParams: PageSizeQueryModel
  ): Promise<PaginationViewModel<CreatedUserViewModel>> {
    const {
      sortBy,
      sortDirection,
      skip,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    } = pageParams;

    const orderBy = transformFirstLetter(sortBy);

    let result = await this.dataSource.query(
      `
        SELECT "Id", "Login", "Password", "Email"
        FROM public."Users"
        WHERE "Login" LIKE $1 AND "Email" LIKE $2
        ORDER BY "${orderBy}" ${sortDirection}
        LIMIT $3 OFFSET $4
      `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`, pageSize, skip]
    );

    let count = await this.dataSource.query(`
      SELECT count (*)
      FROM public."Users"
    `);

    return Paginated.transformPagination<CreatedUserViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      result
    );
  }
}
