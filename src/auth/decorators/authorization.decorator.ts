import { JwtGuard } from '../guards/auth.guard';
import { applyDecorators, UseGuards } from "@nestjs/common";

export function Authorization() {
  return applyDecorators(UseGuards(JwtGuard))
}