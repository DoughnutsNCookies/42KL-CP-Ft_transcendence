import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/users.entity";
import * as CryptoJS from 'crypto-js';
import { Repository } from "typeorm";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const LCYAN = "\x1b[96m"
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

	// Check if the access token is valid with the database
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const REQUEST = context.switchToHttp().getRequest();
		let authCode: string, path: string;
		try {
			authCode = REQUEST.header('Authorization');
			path = "API: " + REQUEST.route.stack[0].method.toUpperCase() + " " + REQUEST.route.path;
		} catch {
			authCode = REQUEST.handshake.headers.authorization;
			path = "Socket: " + REQUEST.nsp.name;
		}

		console.log(LCYAN + "Authorization code:", authCode + RESET);
		try {
			const ACCESS_TOKEN = CryptoJS.AES.decrypt(authCode, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
			console.log(BLUE + "Access token:", ACCESS_TOKEN + RESET);
			const USER_DATA = await this.userRepository.findOne({ where: { accessToken: ACCESS_TOKEN } })
			console.log(USER_DATA !== null ? GREEN + USER_DATA.intraName + " has connected to " + path + RESET : RED + "Authorization is invalid" + RESET);
			return USER_DATA !== null;
		} catch {
			console.log(RED + "Authorization is invalid" + RESET);
			return false;
		}
	}
}
