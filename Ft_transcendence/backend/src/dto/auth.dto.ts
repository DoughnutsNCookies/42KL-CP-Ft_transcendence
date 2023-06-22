import { ApiProperty } from '@nestjs/swagger';

export class GetRedirectDTO {
	constructor(redirectUrl: string) {
		this.redirectUrl = redirectUrl;
	}
	
	@ApiProperty({ example: "http://localhost:3000" })
	redirectUrl: string;
}

export class PostCodeBodyDTO {
	@ApiProperty({ example: "abc123" })
	code: string;
}

export class AuthResponseDTO {
	constructor(accessToken: string, newUser: boolean) {
		this.accessToken = accessToken;
		this.newUser = newUser;
	}

	@ApiProperty({ example: "abc123" })
	accessToken?: null | string;

	@ApiProperty({ example: true })
	newUser: boolean;
}

export class PostCodeForAccessTokenDTO {
	constructor(client_id: string, client_secret: string, code: string) {
		this.grant_type = "authorization_code";
		this.client_id = client_id;
		this.client_secret = client_secret;
		this.code = code;
		this.redirect_uri = process.env.CLIENT_DOMAIN + ":" + process.env.FE_PORT;
	}

	grant_type: string;
	client_id: string;
	client_secret: string;
	code: string;
	redirect_uri: string;
}