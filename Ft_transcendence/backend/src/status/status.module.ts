import { Status } from "src/entity/status.entity";
import { StatusGateway } from "./status.gateway";
import { StatusService } from "./status.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([Status])],
	providers: [StatusGateway, StatusService],
	controllers: [],
})
export class StatusModule {}