import validationMessage from "../middleware/validationMessage";
import {HttpException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, Repository} from "typeorm";
import {UserEntity} from "../db/entities/users.entity";
import {userSearch} from "./dto/search.user.dto";
import {FriendEntity, Status} from "../db/entities/friend.entity";
import {changeStatus} from "./dto/change.status.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(FriendEntity)
        private readonly friendRepo: Repository<FriendEntity>,
    ) {
    }

    async searchUsers(payload: userSearch): Promise<{ message: string, users: object }> {
        const users = await this.userRepo.find({
            where: [
                {firstName: Like(`%${payload.firstName}%`)},
                {lastName: Like(`%${payload.lastName}%`)},
                {age: payload.age}
            ]
        });
        if (!Object.keys(users).length) {
            throw new HttpException(validationMessage.notDefined, 404)
        }
        return {
            message: 'success',
            users: users,
        };
    }

    async sentFriendRequest(receiverId: number, currentUser: UserEntity) {
        const creator = await this.userRepo.findOne({
            where: {
                id: currentUser.id
            },
        })
        const receiver = await this.userRepo.findOne({
            where: {
                id: receiverId,
            }
        })
        if (creator.id == receiver.id) {
            throw new HttpException(validationMessage.sentYourselfRequest, 400)
        }

        const friendShip = await this.friendRepo.find({
            relations: ['receiver', 'creator']
        });
        friendShip.map((f) => {
            if (f.receiver.id == receiver.id && f.creator.id == currentUser.id) {
                throw new HttpException(validationMessage.sentRequestAgain, 400)
            }
        })
        const friend = await this.friendRepo.save({
            creator: creator,
            receiver: receiver
        })
        return {
            message: 'success',
            friend: friend,
        };
    }

    async getRequests(currentUser: UserEntity) {
        const friendShip = await this.friendRepo.find({
            where: {status: Status.PENDING},
            relations: ['receiver', 'creator']
        });
        let result = [];
        friendShip.map((f) => {
            if (f.receiver.id == currentUser.id) {
                result.push(f.creator, f.status)
            }
        });
        if (!result) {
            throw new HttpException(validationMessage.dontHaveRequest, 400)
        }
        return result;
    }

    async changeStatus(friendRequestId: number, payload: changeStatus, currentUser: UserEntity) {
        const receiver = await this.userRepo.findOne({
            where: {
                id: currentUser.id,
            },
        })
        const friendRequest = await this.friendRepo.findOne({
            where: {
                id: friendRequestId
            },
            relations: ['receiver']
        })
        if (friendRequest.receiver.id !== currentUser.id) {
            throw new HttpException(validationMessage.permission, 400)
        }
        const friendShip = await this.friendRepo.find({
            where: [
                {id: friendRequestId},
                {status: Status.PENDING},
                {receiver: receiver}
            ],
            relations: ['receiver', 'creator']
        });

        let result;
        friendShip.map(async (f) => {
            if (f.receiver.id == currentUser.id) {
                f.status = payload.status
                result = await this.friendRepo.update({id: friendRequestId}, f);
            }
        });
        return {
            message: 'Success'
        }
    }

    async getFriends(currentUser: UserEntity) {
        const receiver = await this.userRepo.findOne({
            where: {
                id: currentUser.id,
            },
        })
        const friendShip = await this.friendRepo.find({
            where: [{receiver: receiver}, {status: Status.ACCEPT}],
            relations: ['receiver', 'creator']
        });
        let result = [];
        friendShip.map((f) => {
            if (f.receiver.id == currentUser.id) {
                result.push(f.creator)
            }
        });
        return {
            message: 'Success',
            data: result,
        }
    }

    async deleteFriend(friendRequestId: number, currentUser: UserEntity) {
        const receiver = await this.userRepo.findOne({
            where: {
                id: currentUser.id,
            },
        })
        const friendRequest = await this.friendRepo.findOne({
            where: {
                id: friendRequestId
            },
            relations: ['receiver', 'creator']
        })
        const friendShip = await this.friendRepo.find({
            where: [
                {id: friendRequestId},
                {receiver: receiver}
            ],
            relations: ['receiver', 'creator']
        });
        if (friendRequest.receiver.id == currentUser.id || friendRequest.creator.id == currentUser.id) {
            let result;
            friendShip.map(async (f) => {
                if (f.receiver.id == currentUser.id) {
                    result = await this.friendRepo.delete({id: friendRequestId});
                }
                if (f.creator.id == currentUser.id) {
                    result = await this.friendRepo.delete({id: friendRequestId});
                }
            });
            return {
                message: 'Success'
            }
        }
        throw new HttpException(validationMessage.permission, 400)
    }
}
