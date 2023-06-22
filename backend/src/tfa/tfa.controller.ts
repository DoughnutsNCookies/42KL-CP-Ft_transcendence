import { Controller, Get, Post, Delete, UseGuards, Headers, Body } from "@nestjs/common";
import { ApiCommonHeader } from "src/ApiCommonHeader/ApiCommonHeader.decorator";
import { TfaDTO, TfaPostDTO, TfaValidateDTO } from "src/dto/tfa.dto";
import { ApiOkResponse, ApiTags, ApiHeader } from "@nestjs/swagger";
import { AuthGuard } from 'src/guard/AuthGuard';
import { UserDTO } from "src/dto/user.dto";
import { TFAGuard } from "src/guard/TFAGuard";
import { ErrorDTO } from "src/dto/error.dto";
import { TFAService } from "./tfa.service";

@ApiTags('2FA')
@Controller('2fa')
export class TFAController{
	constructor (private readonly tfaService: TFAService){}

	@Get()
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Generates and returns a new 2FA secret and QR code to the user", type: TfaDTO})
	async requestNewSecret(@Headers('Authorization') accessToken: string): Promise<TfaDTO> {
		return await this.tfaService.requestNewSecret(accessToken);
	}

	@Get('forgot')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid request - You don't have a 2FA setup", "The access token is invalid"])
	@ApiOkResponse({ description: "Generates and sends a new 2FA secret and QR code to the user's email"})
	async forgotSecret(@Headers('Authorization') accessToken: string): Promise<ErrorDTO> {
		return await this.tfaService.forgotSecret(accessToken);
	}
	
	@Post()
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Validates the OTP", type: TfaValidateDTO})
	async validateOTP(@Headers('Authorization') accessToken: string, @Body() body: TfaPostDTO ): Promise<TfaValidateDTO> {
		return await this.tfaService.validateOTP(accessToken, body.otp)
	}

	@Delete()
	@UseGuards(TFAGuard)
	@ApiCommonHeader()
	@ApiHeader({ name: 'OTP', description: 'OTP 6 digit code (eg. 123456)', required: true })
	@ApiOkResponse({ description: "Deletes the user's 2FA secret", type: UserDTO})
	async deleteSecret(@Headers('Authorization') accessToken: string): Promise<UserDTO> {
		return await this.tfaService.deleteSecret(accessToken);
	}
}