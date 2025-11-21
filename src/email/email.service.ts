/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          layoutsDir: join(process.cwd(), 'src/email/templates'),
          partialsDir: join(process.cwd(), 'src/email/templates'),
          defaultLayout: false,
        },
        viewPath: join(process.cwd(), 'src/email/templates'),
        extName: '.hbs',
      }),
    );
  }

  async sendTemplate(
    to: string,
    subject: string,
    template: string,
    context: any,
  ) {
    return this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      template,
      context,
    });
  }
}
