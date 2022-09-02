import { Global, Module } from '@nestjs/common';
import { EmailHelper } from './email.helper';

@Global()
@Module({
  imports: [],
  providers: [EmailHelper],
  exports: [EmailHelper],
})
export class HelperModule {}
