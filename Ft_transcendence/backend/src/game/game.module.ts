import { Module } from "@nestjs/common";
import { ChatService } from "src/chat/chat.service";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";

@Module({
	imports: [],
	controllers: [],
	providers: [GameGateway, GameService],
})
export class GameModule {}