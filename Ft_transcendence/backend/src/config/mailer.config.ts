import { MailerOptions } from "@nestjs-modules/mailer";
import * as dotenv from 'dotenv';

dotenv.config();
export const MAILER_CONFIG: MailerOptions = {
	transport: {
		host: process.env.GOOGLE_APP_HOST,
		auth: {
			user: process.env.GOOGLE_APP_EMAIL,
			pass: process.env.GOOGLE_APP_PASSWORD
		},
		secure: true
	}
}