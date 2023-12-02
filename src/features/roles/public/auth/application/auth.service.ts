import { Injectable } from '@nestjs/common';
import { EmailDataDTO } from './auth.dto';
import { emailAdapter } from '../../../../../utils/emailAdapter';

@Injectable()
export class AuthService {
  async sendEmail(emailDataDTO: EmailDataDTO) {
    const {
      code,
      email,
      letterText,
      letterTitle,
      codeText = 'code',
    } = emailDataDTO;
    await emailAdapter.sendEmail(
      email,
      `${letterTitle}`,
      `<a href="http://localhost:5005/?${codeText}=${code}">${letterText}</a>`,
    );
  }
}
