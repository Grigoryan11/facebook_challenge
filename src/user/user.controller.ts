import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {UserService} from './user.service';
import {JwtAuthGuard} from "../auth/jwt.authGuard";
import {userSearch} from "./dto/search.user.dto";
import {CurrentUser} from "../auth/currentUser.decorator";
import {UserEntity} from "../db/entities/users.entity";
import {changeStatus} from "./dto/change.status.dto";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Get('search-users')
    @UseGuards(JwtAuthGuard)
    async searchUsers(
        @Body() payload: userSearch
    ) {
        return this.userService.searchUsers(payload);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sent-request/:receivedId')
    async sentFriendRequest(
        @Param('receivedId') receivedId: number,
        @CurrentUser() currentUser: UserEntity,
    ) {
        return this.userService.sentFriendRequest(receivedId, currentUser);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-request')
    async getRequests(
        @CurrentUser() currentUser: UserEntity,
    ) {
        return this.userService.getRequests(currentUser);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update-status/:friendRequestId')
    async changeStatus(
        @Param('friendRequestId') friendRequestId: number,
        @Body() payload: changeStatus,
        @CurrentUser() currentUser: UserEntity,
    ) {
        return this.userService.changeStatus(friendRequestId, payload, currentUser);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-friends')
    async getFriends(
        @CurrentUser() currentUser: UserEntity,
    ) {
        return this.userService.getFriends(currentUser);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete-friend/:friendRequestId')
    async deleteFriend(
        @Param('friendRequestId') friendRequestId: number,
        @CurrentUser() currentUser: UserEntity,
    ) {
        return this.userService.deleteFriend(friendRequestId, currentUser);
    }
}
