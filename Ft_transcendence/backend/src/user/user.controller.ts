import { Controller, Get, Headers, UseGuards, Param, Body, UseInterceptors, UploadedFile, Res, Patch } from '@nestjs/common';
import { ApiCommonHeader } from 'src/ApiCommonHeader/ApiCommonHeader.decorator';
import { UserDTO, PatchUserBodyDTO, IntraDTO } from 'src/dto/user.dto';
import { ApiOkResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { INTERCEPTOR_CONFIG } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guard/AuthGuard';
import { UserService } from './user.service';
import { TFAGuard } from 'src/guard/TFAGuard';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid access token - access token decryption failed"])
	@ApiOkResponse({ description: "Retrieves the user's data from the database", type: UserDTO})
	getMyUserData(@Headers('Authorization') accessToken: string): any {
		return this.userService.getMyUserData(accessToken);
	}
	
	@Get('intra')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["The access token is invalid"])
	@ApiOkResponse({ description: "Retrieves the user's data from the 42 Intra API", type: IntraDTO})
	getMyIntraData(@Headers('Authorization') accessToken: string): any {
		return this.userService.getMyIntraData(accessToken);
	}
	
	@Get('intra/:intraName')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include intraName(string)", "Invalid intraName - intraName does not exist", "Invalid friendship - You are blocked by this user"])
	@ApiOkResponse({ description: "Retrieves the user's data from the 42 Intra API based on intraName", type: IntraDTO})
	getIntraDataByIntraName(@Headers('Authorization') accessToken: string, @Param('intraName') intraName: string): any {
		return this.userService.getIntraDataByIntraName(accessToken, intraName);
	}

	@Get('avatar')
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Retrieves and redirects to the user's avatar link from the database"})
	getMyAvatar(@Headers('Authorization') accessToken: string, @Res() res: any): any {
		return this.userService.getMyAvatar(accessToken, res);
	}

	@Get('avatar/:intraName')
	@ApiCommonHeader(["Invalid intraName - user does not exist"])
	@ApiOkResponse({ description: "Retrieves and redirects to the user's avatar link from the database based on intraName"})
	getAvatarByIntraName(@Param('intraName') intraName: string, @Res() res: any): any {
		return this.userService.getAvatarByIntraName(intraName, res);
	}

	@Get(':intraName')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include intraName(string)", "Invalid intraName - user does not exist", "Invalid friendship - you are blocked by this user"])
	@ApiOkResponse({ description: "Retrieves the user's data from the database based on intraName", type: IntraDTO})
	getUserDataByIntraName(@Headers('Authorization') accessToken: string, @Param('intraName') intraName: string): any {
		return this.userService.getUserDataByIntraName(accessToken, intraName);
	}

	@Patch()
	@UseGuards(TFAGuard)
	@ApiCommonHeader()
	@ApiConsumes('multipart/form-data')
	@ApiOkResponse({ description: "Updates the user's userName and avatar", type: UserDTO})
	@UseInterceptors(FileInterceptor('image', INTERCEPTOR_CONFIG))
	updateUserInfo(@Headers('Authorization') accessToken: string, @Body() body: PatchUserBodyDTO, @UploadedFile() image: object): any {
		return this.userService.updateUserInfo(accessToken, body.userName, image);
	}
}