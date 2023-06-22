import { GetRedirectDTO, AuthResponseDTO, PostCodeForAccessTokenDTO } from "src/dto/auth.dto";
import { UserService } from "src/user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/users.entity";
import { Injectable } from "@nestjs/common";
import * as CryptoJS from 'crypto-js';
import { Repository } from "typeorm";
import * as dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class AuthService {
	constructor(@InjectRepository(User) private userRepository: Repository<User>, private userService: UserService) { dotenv.config(); }

	// Starts the login process
	async startLogin(accessToken: string, googleLogin: string): Promise<GetRedirectDTO> {
		try {
			accessToken = CryptoJS.AES.decrypt(accessToken, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8)
			const REDIRECT_URI = process.env.DOMAIN + ":" + process.env.FE_PORT;
			const SCOPE = 'email profile';
			const REDIRECT = googleLogin === "true" ? `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&client_id=${process.env.GOOGLE_CLIENT_ID}` : process.env.APP_REDIRECT;
			return new GetRedirectDTO(((await this.userRepository.findOne({ where: { accessToken: accessToken } })) !== null) ? process.env.CLIENT_DOMAIN + ":" + process.env.FE_PORT : REDIRECT );
		}
		catch {
			return new GetRedirectDTO(process.env.APP_REDIRECT);
		}
	}

	// Use the code from query to get token info
	async postCode(code: string): Promise<AuthResponseDTO> {
		async function saveImage(url: string, intraName: string) {
			const PATH = 'avatar/' + intraName;
			const ROUTE = process.env.DOMAIN + ":" + process.env.BE_PORT + "/user/";
			const response = await axios.get(url, { responseType: 'stream' });
			await new Promise((resolve, reject) => {
				response.data.pipe(fs.createWriteStream(PATH))
					.on('finish', resolve)
					.on('error', reject);
			});
			return ROUTE + PATH;
		}

		let postData = new PostCodeForAccessTokenDTO(process.env.APP_UID, process.env.APP_SECRET, code);
		let apiResponse = await fetch("https://api.intra.42.fr/oauth/token", {
			method: 'POST',
			headers:{ 'Content-Type': 'application/json' },
			body : JSON.stringify(postData),
		});
		let returnData = await apiResponse.json();
		if (returnData.access_token === undefined) {
			postData = new PostCodeForAccessTokenDTO(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, code);
			apiResponse = await fetch("https://oauth2.googleapis.com/token", {
				method: 'POST',
				headers:{ 'Content-Type': 'application/json' },
				body : JSON.stringify(postData),
			});
			returnData = await apiResponse.json();
			apiResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { 'Authorization': 'Bearer ' + returnData.access_token } });
			const GOOGLE_DATA = await apiResponse.json();
			let accessToken = CryptoJS.AES.encrypt(returnData.access_token, process.env.ENCRYPT_KEY).toString()

			if (GOOGLE_DATA.email === undefined)
				return new AuthResponseDTO("", false);
			const ENTITY_USER = await this.userRepository.findOne({ where: { email: GOOGLE_DATA.email } });
			if (ENTITY_USER !== null) {
				ENTITY_USER.accessToken = returnData.access_token;
				await this.userRepository.save(ENTITY_USER);
				return new AuthResponseDTO(accessToken, false);
			}
			
			const QUERY = this.userRepository.createQueryBuilder("user");
			QUERY.select("MIN(user.intraId)", "intraId");
			const LAST_USER = await QUERY.getRawOne();
			const ID = Math.min(LAST_USER.intraId, 0) - 1;
			let intraName = '@' + GOOGLE_DATA.email.substring(0, 5);
			if (GOOGLE_DATA.email.split('@')[0].length < 5)
				intraName = '@' + GOOGLE_DATA.email;
			for (let i = 5; i <= GOOGLE_DATA.email.length && i < 8; i++) {
				intraName = '@' + GOOGLE_DATA.email.substring(0, i);
				if (await this.userRepository.findOne({ where: { intraName: intraName } }) === null) {
					await this.userRepository.save(new User(ID, intraName, intraName, GOOGLE_DATA.email, 400, returnData.access_token, await saveImage(GOOGLE_DATA.picture, intraName), null, true, 400, 0));
					return new AuthResponseDTO(accessToken, true);
				}
			}
			for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
				const TEST = intraName + i.toString();
				if (await this.userRepository.findOne({ where: { intraName: TEST } }) === null) {
					await this.userRepository.save(new User(ID, TEST, TEST, GOOGLE_DATA.email, 400, returnData.access_token, await saveImage(GOOGLE_DATA.picture, TEST), null, true, 400, 0));
					return new AuthResponseDTO(accessToken, true);
				}
			}
		}
		let accessToken = CryptoJS.AES.encrypt(returnData.access_token, process.env.ENCRYPT_KEY).toString()
		const INTRA_DTO = await this.userService.getMyIntraData(accessToken);
		const ENTITY_USER = await this.userRepository.findOne({ where: {intraId: INTRA_DTO.id} });
		if (ENTITY_USER) {
			ENTITY_USER.accessToken = returnData.access_token;
			await this.userRepository.save(ENTITY_USER);
		} else {
			await this.userRepository.save(new User(INTRA_DTO.id, INTRA_DTO.name, INTRA_DTO.name, INTRA_DTO.email, 400, returnData.access_token, await saveImage(INTRA_DTO.imageLarge, INTRA_DTO.name), null, true, 400, 0));
			return new AuthResponseDTO(accessToken, true);
		}
		return new AuthResponseDTO(accessToken, false);
	}
}