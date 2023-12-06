import { Controller, Delete, HttpCode } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class DeleteAllTestingData {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteRegistrationTableData() {
    await this.dataSource.query(`DELETE FROM public."Registration"`);
  }
  async deleteUserTableData() {
    await this.dataSource.query(`DELETE FROM public."Users"`);
  }
}

@Controller("testing")
export class DeleteDataController {
  constructor(private readonly deleteRepository: DeleteAllTestingData) {}

  @Delete("/all-data")
  @HttpCode(204)
  async deleteTestData() {
    await this.deleteRepository.deleteRegistrationTableData();
    await this.deleteRepository.deleteUserTableData();
  }
}
