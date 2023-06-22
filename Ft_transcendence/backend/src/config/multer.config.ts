import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const INTERCEPTOR_CONFIG: MulterModuleOptions = {
	storage: diskStorage({
		destination: './avatar',
		filename: (req, file, cb) => { cb(null, file.originalname); }
	}),
	limits: {
		files: 1,
		fileSize: 3000000
	}
}

export const MULTER_CONFIG: MulterModuleOptions = {
	dest: './avatar',
	limits: {
		files: 1,
		fileSize: 3000000
	},
}
