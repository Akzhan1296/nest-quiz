import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BlockIpsRepository } from "./ip/ip.repository";

export type IpsDataDto = {
  ip: string;
  path: string;
  date: number;
};

@Injectable()
export class BlockIpsService {
  constructor(private readonly blockIpsRepository: BlockIpsRepository) {}

  async addIpData(ipsData: IpsDataDto): Promise<boolean> {
    const ipId = await this.blockIpsRepository.addIpData(ipsData);
    return !!ipId;
  }

  //scheduler
  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.blockIpsRepository.dropIps();
  }
}
