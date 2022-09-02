import {IsEmail, IsIn, IsNotEmpty, IsString, Matches} from 'class-validator';
import validationMessage from '../../middleware/validationMessage';
import {Gender} from '../../db/entities/users.entity';

export class signIn {
    @IsEmail({message: validationMessage.email})
    email: string;

    @IsNotEmpty()
    password: string;
}

export class signUp {
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    age: number;

    @IsEmail()
    email: string;

    @Matches(/^[\+]?[(]?[0-9]{3}[)]?[0-9]{3}[-\s\.]?[0-9]{3}$/im, {
        message: validationMessage.phone,
    })
    phone: string;

    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-])[A-Za-z\d@$!%*#?&-]{8,}$/, {
        message: validationMessage.password,
    })
    password: string;

    @IsIn(['male', 'female'])
    gender: Gender;

    @IsNotEmpty()
    confirmPassword: string;
}

export class changePassword {
    @IsNotEmpty()
    oldPassword: string;

    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-])[A-Za-z\d@$!%*#?&-]{8,}$/, {
        message: validationMessage.password,
    })
    newPassword: string;

    @IsNotEmpty()
    confirmPassword: string;
}

export class resetPassword {
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-])[A-Za-z\d@$!%*#?&-]{8,}$/, {
        message: validationMessage.password,
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    passwordConfirm: string;
}

export class requireReset {
    @IsEmail({}, { message: 'Email is required' })
    @IsString()
    @IsNotEmpty()
    email: string;
}