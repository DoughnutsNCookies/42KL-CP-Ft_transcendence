import { Controller, Get, Headers } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';
import { GetRedirectDTO } from './dto/auth.dto';

@ApiTags('App')
@Controller()
export class AppController {
	constructor(private readonly authService: AuthService) {}

	@Get()
	@ApiOkResponse({ description: "Used to initiate the login process for a user", type: GetRedirectDTO })
	@ApiHeader({ name: 'Authorization', description: 'The encrypted access token of the user', required: false })
	@ApiHeader({ name: 'GoogleLogin', description: 'Whether the login is for google', required: false })
	startLogin(@Headers('Authorization') accessToken: string, @Headers('GoogleLogin') googleLogin: string): Promise<GetRedirectDTO> {
		return this.authService.startLogin(accessToken, googleLogin);
	}
}
