import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { ContactRequestDto } from './dto/contact-request.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Contact')
@Controller('contact')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Send contact form', description: 'Receives contact form data and sends an email + logs to database' })
  @ApiOkResponse({ description: 'Successfully sent' })
  async sendMail(@Body() dto: ContactRequestDto) {
    return await this.mailService.processContactRequest(dto);
  }
}


