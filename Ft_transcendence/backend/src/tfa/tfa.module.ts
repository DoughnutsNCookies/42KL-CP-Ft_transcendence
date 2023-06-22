import { TFAController } from "./tfa.controller";
import { TFAService } from "./tfa.service";
import { Module } from "@nestjs/common";

@Module({
	controllers: [TFAController],
	providers: [TFAService],
})
export class TFAModule {}