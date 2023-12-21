import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Request, Response } from "express";

export class DeleteAllTestingData {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteRegistrationTableData() {
    await this.dataSource.query(`DELETE FROM public."Registration"`);
  }
  async deleteAuthSessionTableData() {
    await this.dataSource.query(`DELETE FROM public."AuthSessionsMetaData"`);
  }
  async deleteUserTableData() {
    await this.dataSource.query(`DELETE FROM public."Users"`);
  }
  async deleteIpsTableData() {
    await this.dataSource.query(`DELETE FROM public."Ips"`);
  }
}

@Controller("testing")
export class DeleteDataController {
  constructor(private readonly deleteRepository: DeleteAllTestingData) {}

  @Delete("/all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTestData(@Req() request: Request, @Res() response: Response) {
    await this.deleteRepository.deleteRegistrationTableData();
    await this.deleteRepository.deleteAuthSessionTableData();
    await this.deleteRepository.deleteUserTableData();

    return response.status(HttpStatus.NO_CONTENT).send();
  }
}
