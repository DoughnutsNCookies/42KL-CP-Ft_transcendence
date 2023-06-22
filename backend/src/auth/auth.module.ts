import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers : [AuthController],
	providers : [AuthService]
})
export class AuthModule {}
