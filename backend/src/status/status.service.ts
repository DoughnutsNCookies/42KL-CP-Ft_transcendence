import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/entity/status.entity';
import { ErrorDTO } from 'src/dto/error.dto';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status) private statusRepository: Repository<Status>,
    private userService: UserService,
  ) {}

	// New user connection
	async userConnect(client: any, server: any): Promise<any> {
		try {
			const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
			const STATUS = await this.statusRepository.findOne({ where: {intraName: USER_DATA.intraName} });
			client.join(USER_DATA.intraName);
			if (STATUS !== null) {
				STATUS.clientId = client.id;
				STATUS.status = "ONLINE";
				await this.statusRepository.save(STATUS);
			} else {
				await this.statusRepository.save(new Status(USER_DATA.intraName, client.id, "ONLINE"));
			}
			server.to(USER_DATA.intraName).emit('statusRoom', { "intraName": USER_DATA.intraName, "status": "ONLINE" });
		} catch {
			return;
		}
	}
	
	// User disconnection
	async userDisconnect(client: any, server: any): Promise<any> {
		try {
			const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
			const STATUS = await this.statusRepository.findOne({ where: {clientId: client.id} });
			if (STATUS === null)
				return server.emit('statusRoom', new ErrorDTO(false, "Invalid client id - Client ID not found"));
			server.to(USER_DATA.intraName).emit('statusRoom', { "intraName": STATUS.intraName, "status": "OFFLINE" });
			STATUS.status = "OFFLINE";
			await this.statusRepository.save(STATUS);
		} catch {
			return;
		}
	}

	// User status change
	async changeStatus(client: any, server: any, newStatus: string): Promise<any> {
		const STATUS = await this.statusRepository.findOne({ where: {clientId: client.id} });
		if (STATUS === null)
			return server.emit('changeStatus', new ErrorDTO(false, "Invalid client id - Client ID not found"));
		if (newStatus === undefined || (newStatus.toUpperCase() != "ONLINE" && newStatus.toUpperCase() != "INGAME"))
			return server.emit('changeStatus', new ErrorDTO(false, "Invalid status - status can only be ONLINE or INGAME"));
		server.to(STATUS.intraName).emit('changeStatus', { "intraName": STATUS.intraName, "status": newStatus.toUpperCase() });
		server.to(STATUS.intraName).emit('statusRoom', { "intraName": STATUS.intraName, "status": newStatus.toUpperCase() });
		STATUS.status = newStatus.toUpperCase();
		await this.statusRepository.save(STATUS)
	}

	// User join status room based on intraName
	async statusRoom(client: any, server: any, intraName: string, joining: boolean): Promise<any> {
		if (intraName === undefined)
			return;
		if (joining === undefined)
			return server.to(intraName).emit('statusRoom', new ErrorDTO(false, "Invalid body - joining(boolean) is undefined"));
		if (joining === true) {
			const FRIEND_STATUS = await this.statusRepository.findOne({ where: {intraName: intraName} });
			if (FRIEND_STATUS === null)
				return server.to(intraName).emit('statusRoom', new ErrorDTO(false, "Invalid intraName - IntraName not found"));
			client.join(intraName);
			server.to(intraName).emit('statusRoom', { "intraName": FRIEND_STATUS.intraName, "status": FRIEND_STATUS.status });
		} else {
			client.leave(intraName);
		}
	}
}
