import { Channel } from "src/entity/channel.entity";
import { Message } from "src/entity/message.entity";
import { ChatController } from "./chat.controller";
import { Member } from "src/entity/member.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([Channel, Member, Message])],
	controllers: [ChatController],
	providers: [ChatGateway, ChatService],
})
export class ChatModule {}