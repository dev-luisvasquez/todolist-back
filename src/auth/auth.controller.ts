import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/users/dto/user.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() userDto: UserDto) {
        return this.authService.SignUp({ userDto });
    }

    @Post('signin')
    async signIn(@Body() body: { email: string; password: string }) {
        return this.authService.SignIn(body);
    }

    @Post('refresh-token')
    async refreshToken(@Headers('x-refresh-token') refreshToken: string) {
        return this.authService.RefreshTokenValidate(refreshToken);
    }
}
