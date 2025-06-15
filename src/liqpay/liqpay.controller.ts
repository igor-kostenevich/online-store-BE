import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { LiqpayService } from './liqpay.service'
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller()
export class LiqpayController {
  constructor(private readonly liqpayService: LiqpayService) {}

  @Post('payment-callback')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle LiqPay payment callback' })
  @ApiBody({
    description: 'LiqPay callback data',
    type: Object,
    examples: {
      example1: {
        value: {
          data: 'base64-encoded-data',
          signature: 'signature',
        },
      },
    },
  })
  async handleCallback(@Body() body: { data: string; signature: string }) {
    return this.liqpayService.handleCallback(body.data, body.signature)
  }
}
