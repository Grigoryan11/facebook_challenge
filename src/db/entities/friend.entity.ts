import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {UserEntity} from "./users.entity";

export enum Status {
    ACCEPT = 'accept',
    PENDING = 'pending',
    CANCELED = 'canceled'
}

@Entity({
    name: 'friends',
})
export class FriendEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'enum', enum: Status, default: Status.PENDING})
    status: Status;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequest)
    @JoinColumn()
    creator: UserEntity;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.receivedFriendRequest)
    receiver: UserEntity;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}