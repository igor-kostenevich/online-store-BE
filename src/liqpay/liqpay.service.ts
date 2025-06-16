import { OrderStatus } from '@prisma/client';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import * as crypto from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class LiqpayService {
  private readonly publicKey = process.env.LIQPAY_PUBLIC_KEY
  private readonly privateKey = process.env.LIQPAY_PRIVATE_KEY

  constructor(private readonly prismaService: PrismaService) {}

  generateCheckoutData(order: {
    amount: number
    description: string
    order_id: string
    result_url: string
    server_url: string
  }) {
    const dataObj = {
      public_key: this.publicKey,
      version: '3',
      action: 'pay',
      amount: order.amount,
      currency: 'USD',
      description: order.description,
      order_id: order.order_id,
      sandbox: 1, // test mode
      result_url: order.result_url,
      server_url: order.server_url,
    }

    const data = Buffer.from(JSON.stringify(dataObj)).toString('base64')
    const signature = crypto
      .createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64')

    return { data, signature }
  }

  async handleCallback(data: string, signature: string) {
    const expectedSignature = crypto
      .createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64')
  
    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid LiqPay signature')
    }
  
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf8'))
    const { order_id, status } = decoded
  
    let newStatus: OrderStatus
  
    switch (status) {
      case 'success':
      case 'sandbox':
        newStatus = OrderStatus.paid
        break
      case 'failure':
      case 'error':
        newStatus = OrderStatus.failed
        break
      default:
        newStatus = OrderStatus.pending
    }
  
    await this.prismaService.order.update({
      where: { id: order_id },
      data: { status: newStatus },
    }).catch(() => {
      throw new NotFoundException(`Order with id=${order_id} not found`);
    });
  
    return { received: true, status: newStatus }
  }  
}
