import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../db/entities/users.entity";
import {FriendEntity} from "../db/entities/friend.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, FriendEntity])],
    controllers: [UserController],
    providers: [UserService]
})
export class UserModule {
}
