import { ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { GetRedirectDTO, PostCodeBodyDTO, AuthResponseDTO } from 'src/dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get()
	@ApiHeader({ name: 'Authorization', description: 'The encrypted access token of the user', required: false })
	@ApiHeader({ name: 'GoogleLogin', description: 'Whether the login is for google', required: false })
	@ApiOkResponse({ description: "Used to initiate the login process for a user", type: GetRedirectDTO })
	startLogin(@Headers('Authorization') accessToken: string, @Headers('GoogleLogin') googleLogin: string): Promise<GetRedirectDTO> {
		return this.authService.startLogin(accessToken, googleLogin);
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	@ApiOkResponse({ description: "Used to initiate the google login process for a user, requesting code from google (Code will expire upon use)" })
	startGoogleLogin(@Req() req: any): any {
		return;
	}
	
	@Post()
	@ApiCreatedResponse({ description: "Used to trade the code to get the access token of a user (Code will expire upon use)", type: AuthResponseDTO })
	postCode(@Body() body: PostCodeBodyDTO): Promise<AuthResponseDTO> {
		return this.authService.postCode(body.code);
	}
}
