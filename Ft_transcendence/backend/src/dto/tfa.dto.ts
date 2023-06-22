import { ApiProperty } from "@nestjs/swagger";

export class TfaDTO {
	constructor(qr: string, secret: string) {
		this.qr = qr;
		this.secret = secret;
	}
	
	@ApiProperty({ example: "data:image/png;base64, ABC123" })
	qr: string;

	@ApiProperty({ example: "ABC123" })
	secret: string;
}

export class TfaPostDTO {
	@ApiProperty({ example: "123456" })
	otp: string;
}

export class TfaValidateDTO {
	constructor(success: boolean) {
		this.success = success;
	}

	@ApiProperty({ example: true })
	success: boolean;
}