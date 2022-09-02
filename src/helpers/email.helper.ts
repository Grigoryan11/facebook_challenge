import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailConfigOptions } from '../config/email.config';

@Injectable()
export class EmailHelper {
  async sendEmail(to, subject, body) {
    const transporter = nodemailer.createTransport(EmailConfigOptions);
    const message = {
      to,
      subject,
      html: body,
    };
    transporter.sendMail(message, (err, info) => {
      if (err) return console.log(err);
      return console.log('Email send:', info);
    });
  }
}
