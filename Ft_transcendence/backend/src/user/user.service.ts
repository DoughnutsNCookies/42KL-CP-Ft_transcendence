import { Friendship } from "src/entity/friendship.entity";
import { IntraDTO } from "../dto/user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entity/users.entity";
import { ErrorDTO } from "src/dto/error.dto";
import { Injectable } from "@nestjs/common";
import * as CryptoJS from 'crypto-js';
import { Repository } from "typeorm";
import * as sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private userRepository: Repository<User>, @InjectRepository(Friendship) private friendshipRepository: Repository<Friendship>) {}

	// Use access token to get user info
	async getMyUserData(accessToken: string) : Promise<any> {
		try {
			accessToken = CryptoJS.AES.decrypt(accessToken, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
		} catch {
			return new ErrorDTO(true, "Invalid access token - access token decryption failed");
		}
		const USER_DATA = await this.userRepository.findOne({ where: {accessToken} });
		if (USER_DATA === null)
			return new ErrorDTO(true, "Invalid access token - access token does not exist");
		USER_DATA.accessToken = "hidden";
		USER_DATA.tfaSecret = USER_DATA.tfaSecret === null ? "DISABLED" : "ENABLED";
		return USER_DATA;
	}
	
	// Use access token to get intra user info
	async getMyIntraData(accessToken: string) : Promise<any> {
		try {
			accessToken = CryptoJS.AES.decrypt(accessToken, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
		} catch {
			accessToken = null;
		}
		const HEADER = "Bearer " + accessToken;
		const RESPONSE = await fetch("https://api.intra.42.fr/v2/me", {
			method : "GET",
			headers : { 'Authorization': HEADER }
		});
		if (RESPONSE.status !== 200)
			return new ErrorDTO(true, (await RESPONSE.json()).error);
		const USER_DATA = await RESPONSE.json();
		return new IntraDTO(USER_DATA.id, USER_DATA.url, USER_DATA.login, USER_DATA.email, USER_DATA.image.versions.medium, USER_DATA.image.versions.large, USER_DATA.cursus_users[1].blackholed_at);
	}

	// Use intraName to get user info
	async getUserDataByIntraName(accessToken: string, intraName: string): Promise<any> {
		if (intraName === undefined)
			return new ErrorDTO(true, "Invalid body - body must include intraName(string)");
		const USER_DATA = await this.getMyUserData(accessToken);
		const FRIEND_DATA = await this.userRepository.findOne({ where: {intraName} });
		if (FRIEND_DATA === null)
			return new ErrorDTO(true, "Invalid intraName - user does not exist");
		const FRIENDSHIP = await this.friendshipRepository.findOne({ where: [{sender: {intraName: USER_DATA.intraName}, receiver: {intraName: FRIEND_DATA.intraName}}, {sender: {intraName: FRIEND_DATA.intraName}, receiver: {intraName: USER_DATA.intraName}}] });
		if (FRIENDSHIP !== null && FRIENDSHIP.status === "BLOCKED")
			return new ErrorDTO(true, "Invalid friendship - you are blocked by this user");
		return this.hideData(FRIEND_DATA);
	}

	// Use intraName to get intra user info
	async getIntraDataByIntraName(accessToken: string, intraName: string): Promise<any> {
		try {
			accessToken = CryptoJS.AES.decrypt(accessToken, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
		} catch {
			accessToken = null;
		}
		const HEADER = "Bearer " + accessToken;
		let response = await fetch("https://api.intra.42.fr/v2/users?filter[login]=" + intraName, {
			method : "GET",
			headers : { 'Authorization': HEADER }
		});
		let userData = await response.json();
		if (userData.error !== undefined)
			return new ErrorDTO(true, userData.error);
		if (response.status !== 200 || userData.length === 0)
			return new ErrorDTO(true, userData.error);
		response = await fetch("https://api.intra.42.fr/v2/users/" + userData[0].id, {
			method : "GET",
			headers : { 'Authorization': HEADER }
		});
		userData = await response.json();
		return new IntraDTO(userData.id, userData.url, userData.login, userData.email, userData.image.versions.medium, userData.image.versions.large, userData.cursus_users[1].blackholed_at);
	}

	// Gets user avatar by intraName
	async getMyAvatar(accessToken: string, res: any): Promise<any> {
		try {
			accessToken = CryptoJS.AES.decrypt(accessToken, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
		} catch {
			accessToken = null;
		}
		const USER_DATA = await this.userRepository.findOne({ where: {accessToken} });
		return res.sendFile(USER_DATA.avatar.substring(USER_DATA.avatar.indexOf('avatar/')), { root: '.' });
	}

	// Use intraName to get user avatar
	async getAvatarByIntraName(intraName: string, res: any): Promise<any> {
		const USER_DATA = await this.userRepository.findOne({ where: {intraName} });
		return USER_DATA === null ? new ErrorDTO(true, "Invalid intraName - user does not exist") : res.sendFile(USER_DATA.avatar.substring(USER_DATA.avatar.indexOf('avatar/')), { root: '.' });
	}

	// Updates existing user by saving their userName and avatar
	async updateUserInfo(accessToken: string, userName: string, image: any): Promise<any> {
		if (image === undefined)
			return new ErrorDTO(true, "Invalid image path - no avatar image given");
		try {
			accessToken = CryptoJS.AES.decrypt(accessToken, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
		} catch {
			accessToken = null;
		}
		const NEW_USER = await this.userRepository.findOne({ where: {accessToken} });
		const EXISTING = await this.userRepository.findOne({ where: {userName} });
		if (EXISTING !== null && accessToken !== EXISTING.accessToken)
			return new ErrorDTO(true, "Invalid username - username already exists or invalid");
		if (userName.length > 16 || userName.length < 1 || /^[a-zA-Z0-9_-]+$/.test(userName) === false)
			return new ErrorDTO(true, "Invalid username - username must be 1-16 between alphanumeric characters (Including '-' and '_') only");
		fs.rename(image.path, "avatar/" + NEW_USER.intraName, () => {});
		image.path = "avatar/" + NEW_USER.intraName;
		NEW_USER.avatar = process.env.DOMAIN + ":" + process.env.BE_PORT + "/user/" + image.path;
		NEW_USER.userName = userName;
		fs.writeFile(image.path, await sharp(image.path).resize({ width: 500, height: 500}).toBuffer(), () => {});
		await this.userRepository.save(NEW_USER);
		return this.hideData(NEW_USER);
	}

	// Helper function to hides sensitive data
	hideData(body: any): any {
		if (body === undefined)
			return body;

		if (Array.isArray(body)) {
			if (body.length === 0)
				return body;
			for (let i = 0; i < body.length; i++)
				body[i] = this.hideData(body[i]);
			return body;
		}
		
		if (typeof body === "object" && body !== null) {
			const OBJ = {};
			for (const [key, value] of Object.entries(body)) {
				OBJ[key] = this.hideData(value);
				if (key === "accessToken")
					OBJ[key] = "HIDDEN";
				else if (key === "tfaSecret")
					OBJ[key] = "HIDDEN";
				else if (key === "password")
					OBJ[key] = OBJ[key] === null ? null : "HIDDEN";
			}
			return OBJ;
		}
		return body;
	}

	// Helper function to Update user elo and winning
	async updateUserElo(intraName: string, elo: number, winning: boolean) {
		const USER = await this.userRepository.findOne({ where: { intraName: intraName } });
		if (USER === null)
			return;
		USER.elo = elo;
		USER.winning = winning;
		USER.winStreak = winning ? USER.winStreak + 1 : 0;
		USER.highestElo = elo > USER.highestElo ? elo : USER.highestElo;
		this.userRepository.save(USER);
	}
}