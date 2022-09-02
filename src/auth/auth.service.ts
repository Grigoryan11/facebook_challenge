import {HttpException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../db/entities/users.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {v4 as uuidv4} from 'uuid';
import {changePassword, requireReset, resetPassword, signIn, signUp} from "./dto/auth.dto";
import * as bcrypt from "bcrypt";
import validationMessage from "../middleware/validationMessage";
import {JwtInterface} from "./interface/jwt.interface";
import {EmailHelper} from '../helpers/email.helper';
import {sendPasswordReset, userActivationTemplate,} from '../emailTamplates/email.tamplates';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly emailHelper: EmailHelper,
    ) {
    }

    async createUser(payload: signUp): Promise<{ message: string, token: string }> {
        const user = await this.userRepo.findOne({
            where: {
                email: payload.email,
            },
        });
        if (!user) {
            const data: JwtInterface = {
                email: payload.email,
            };
            if (payload.password === payload.confirmPassword) {
                payload.password = bcrypt.hashSync(payload.password, 10);
                const token = this.jwtService.sign(data);
                await this.userRepo.save(payload);
                const User = await this.createEmailCode(payload.email);
                await this.emailHelper.sendEmail(
                    payload.email,
                    `Message for( Account activation ) ✔`,
                    userActivationTemplate(User, token),
                );
                return {
                    message: validationMessage.registrationCompleted,
                    token: token,
                };
            } else {
                throw new HttpException(validationMessage.passwordsNotMatch, 400);
            }
        }
        throw new HttpException(validationMessage.emailExists, 400);
    }

    private async createEmailCode(email: string): Promise<UserEntity> {
        await this.userRepo.update({email}, {emailCode: uuidv4()});
        return this.userRepo.findOne({where: {email: email}});
    }

    async confirmEmail(data: string): Promise<{ message: string }> {
        const decoded = this.jwtService.decode(data) as JwtInterface;
        if (!decoded) {
            throw new HttpException(validationMessage.notDefined, 404);
        }
        const user = await this.userRepo.findOne({
            where: {
                email: decoded.email,
            },
        });
        if (user && user.isActive == false) {
            user.isActive = true;
            await this.userRepo.save(user);
            return {
                message: validationMessage.accountActivated,
            };
        } else {
            return {
                message: validationMessage.alreadyActive,
            };
        }
    }

    async loginUser(payload: signIn): Promise<{ message: string, data: object }> {
        const user = await this.userRepo.findOne({
            where: {
                email: payload.email,
            }
        })
        if (!user) {
            throw new HttpException(validationMessage.invalid, 400);
        }
        if (user && user.isActive == true) {
            if (user && bcrypt.compareSync(payload.password, user.password)) {
                const token = this.jwtService.sign({
                    id: user.id,
                    email: user.email,
                });
                return {
                    message: 'Success',
                    data: {
                        token: token,
                    }
                }
            } else {
                throw new HttpException(validationMessage.invalid, 400);
            }
        } else if (user && user.isActive == false) {
            throw new HttpException(validationMessage.userNotActive, 400);
        } else {
            throw new HttpException(validationMessage.notDefined, 404);
        }
    }

    async changePassword(currentUser: UserEntity, payload: changePassword): Promise<{ message: string }> {
        const user = await this.userRepo.findOne({
            where: {
                email: currentUser.email,
            },
        });
        if (!user) {
            throw new HttpException(validationMessage.permission, 400);
        }
        const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
        if (isMatch) {
            if (payload.newPassword === payload.confirmPassword) {
                payload.newPassword = bcrypt.hashSync(payload.newPassword, 10);
                user.password = payload.newPassword;
                const update = await this.userRepo.save(user);
                if (update) {
                    return {
                        message: validationMessage.passwordChanged,
                    };
                }
            } else {
                throw new HttpException(
                    validationMessage.passwordsNotMatch,
                    401,
                );
            }
        } else {
            throw new HttpException(validationMessage.oldPassInvalid, 400);
        }
    }

    async requirePasswordChange(
        payload: requireReset,
    ): Promise<{ message: string }> {
        const user = await this.userRepo.findOne({where: {email: payload.email}});
        if (!user) {
            throw new HttpException(validationMessage.notDefined, 404);
        }
        const User = await this.createEmailCode(payload.email);
        await this.emailHelper.sendEmail(
            payload.email,
            `Message for ( Password reset ) ✔`,
            sendPasswordReset(User),
        );
        return {
            message: validationMessage.checkEmail,
        };
    }

    async resetPassword(
        id: number,
        payload: resetPassword,
        uuid: string
    ): Promise<{ message: string }> {
        if (payload.password !== payload.passwordConfirm) {
            throw new HttpException(validationMessage.passwordsNotMatch, 401);
        }
        const user = await this.userRepo.findOne({
            where: {
                emailCode: uuid,
            },
        });
        if (!user) {
            throw new HttpException(validationMessage.notDefined, 404)
        }
        if (payload.password === payload.passwordConfirm) {
            user.password = await bcrypt.hash(payload.password, 10);
            await this.userRepo.save(user);
            return {
                message: 'Success',
            };
        } else {
            throw new HttpException(
                validationMessage.passwordsNotMatch,
                401,
            );
        }
    }

}
