import { ApiProperty } from "@nestjs/swagger";

export class UserDTO {
	constructor(intraId: number, userName: string, intraName: string, email: string, elo: number, accessToken: string, avatar: string, tfaSecret: string, winning: boolean) {
		this.intraId = intraId;
		this.userName = userName;
		this.intraName = intraName;
		this.email = email;
		this.elo = elo;
		this.accessToken = accessToken;
		this.avatar = avatar;
		this.tfaSecret = tfaSecret;
		this.winning = winning;
	}

	@ApiProperty({ example: 111856 })
	intraId: number;

	@ApiProperty({ example: "Doughnuts" })
	userName: string;
	
	@ApiProperty({ example: "schuah" })
	intraName: string;

	@ApiProperty({ example: "chuahtseyung2002@gmail.com" })
	email: string;

	@ApiProperty({ example: 9999 })
	elo: number;

	@ApiProperty({ example: "HIDDEN" })
	accessToken: string;

	@ApiProperty({ example: "http://localhost:3000/user/avatar/schuah" })
	avatar: string;

	@ApiProperty({ example: "HIDDEN | DISABLED | ENABLED" })
	tfaSecret: string;

	@ApiProperty({ example: true })
	winning: boolean;
}

export class PatchUserBodyDTO {
	@ApiProperty({ example: "Doughnuts" })
	userName: string;

	@ApiProperty({ example: "doughnuts.png" })
	image: object;
}

export class IntraDTO {
	constructor(id: number, url: string, name: string, email: string, imageMedium: string, imageLarge: string, blackhole: string) {
		this.id = id;
		this.url = url;
		this.name = name;
		this.email = email;
		this.imageMedium = imageMedium;
		this.imageLarge = imageLarge;
		this.blackhole = blackhole;
	}

	@ApiProperty({ example: 123456 })
	id: number;

	@ApiProperty({ example: "https://profile.intra.42.fr/users/schuah" })
	url: string;

	@ApiProperty({ example: "schuah" })
	name : string;

	@ApiProperty({ example: "chuahtseyung2002@gmail.com" })
	email: string;

	@ApiProperty({ example: "https://cdn.intra.42.fr/users/35c7aaec80abfb60fc29ebf7c8392d41/medium_schuah.jpg" })
	imageMedium: string;

	@ApiProperty({ example: "https://cdn.intra.42.fr/users/315decdcdd0db6b55ce4086f585d58c5/large_schuah.jpg" })
	imageLarge: string;

	@ApiProperty({ example: "2024-05-22T00:00:00.000Z" })
	blackhole: string;
}