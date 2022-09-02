import {
    Column,
    CreateDateColumn,
    Entity, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {FriendEntity} from "./friend.entity";

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

@Entity({
    name: 'users',
})
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    password: string;

    @Column()
    phone: string;

    @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
    gender: Gender;

    @Column()
    age: number;

    @Column({ type: 'varchar', nullable: true })
    emailCode: string;

    @Column({ default: false })
    isActive: boolean;

    @OneToMany(() => FriendEntity, (friendEntity) => friendEntity.creator)
    sentFriendRequest: FriendEntity[];

    @OneToMany(() => FriendEntity, (friendEntity) => friendEntity.receiver)
    receivedFriendRequest: FriendEntity[];

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}