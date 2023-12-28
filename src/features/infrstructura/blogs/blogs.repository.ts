import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateBlogDTO } from "./blogs.models";

export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(createBlogDTO: CreateBlogDTO): Promise<string> {
    const { createdAt, description, isMembership, name, websiteUrl } =
      createBlogDTO;
    const result = await this.dataSource.query(
      `INSERT INTO public."Blogs"(
        "Name", "WebsiteUrl", "Description", "IsMembership", "CreatedAt")
        VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id"`,
      [name, websiteUrl, description, isMembership, createdAt]
    );
    return result[0].Id;
  }
}
