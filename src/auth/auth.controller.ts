import {Body, Controller, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {changePassword, requireReset, resetPassword, signIn, signUp} from "./dto/auth.dto";
import {JwtAuthGuard} from "./jwt.authGuard";
import {CurrentUser} from "./currentUser.decorator";
import {UserEntity} from "../db/entities/users.entity";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async userSignup(
        @Body() payload: signUp,
    ): Promise<{ message: string }> {
        return this.authService.createUser(payload);
    }

    @Patch('active/:data')
    async token(@Param('data') data: string): Promise<{ message: string }> {
        return this.authService.confirmEmail(data);
    }

    @Post('login')
    async loginUser(@Body() payload: signIn): Promise<{ message: string }> {
        return this.authService.loginUser(payload)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('changePassword')
    async changeUserPass(
        @CurrentUser() currentUser: UserEntity,
        @Body() payload: changePassword,
    ): Promise<{ message: string }> {
        return this.authService.changePassword(currentUser, payload);
    }

    @Post('require-reset')
    async requirePasswordChange(
        @Body() payload: requireReset,
    ): Promise<{ message: string }> {
        return this.authService.requirePasswordChange(payload);
    }

    @Post('reset-password/:id/:uuid')
    async resetPassword(
        @Param('id') id: number,
        @Param('uuid') uuid: string,
        @Body() payload: resetPassword,
    ): Promise<{ message: string }> {
        return this.authService.resetPassword(id, payload, uuid);
    }
}
