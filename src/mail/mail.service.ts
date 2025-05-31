import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import * as sgMail from '@sendgrid/mail';
import { ContactRequestDto } from "./dto/contact-request.dto";

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!sendGridApiKey) {
      throw new InternalServerErrorException('SENDGRID_API_KEY is not defined in the configuration');
    }
    sgMail.setApiKey(sendGridApiKey);
  }

  async processContactRequest(dto: ContactRequestDto) {
    if (dto.hidden) {
      return { success: true, message: 'Thank you!' };
    }

    await this.prisma.contactRequest.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || '',
        message: dto.message,
      },
    });

    const toEmail = this.configService.get<string>('EMAIL_TO');

    const msg = {
      to: toEmail,
      from: {
        email: 'noreply@em6741.family-love-haven.com',
        name: 'Online Store Contact',
      },
      replyTo: {
        email: dto.email || 'noreply@em6741.family-love-haven.com',
        name: dto.name || 'Anonymous',
      },
      subject: `New Contact Request from ${dto.name}`,
      text: `New contact request from ${dto.name} (${dto.email}, ${dto.phone}):\n\n${dto.message}`,
      html: this.buildHtmlTemplate(dto.name, dto.email, dto.phone, dto.message),
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Your message has been sent!' };
    } catch (error) {
      console.error('SendGrid error:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  private buildHtmlTemplate(
    name: string,
    email: string,
    phone: string,
    message: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #d33;">📩 New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="white-space: pre-line;">${message}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <small style="color: #999;">Received on ${new Date().toLocaleString('uk-UA')}</small>
      </div>
    `;
  }
}

