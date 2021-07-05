import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';
import { UserRepository } from '../users/user.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { randomBytes } from 'crypto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface EmailOptionsContext {
  token: string;
}

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  template: string;
  context: EmailOptionsContext;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  private mailFactory(
    email: string,
    token: string,
    subject: string,
    template: string,
  ): EmailOptions {
    return {
      to: email,
      from: 'noreply@application.com',
      subject,
      template,
      context: { token },
    };
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem!');
    } else {
      const user = await this.userRepository.createUser(
        createUserDto,
        UserRole.USER,
      );
      const { email, confirmationToken: token } = user;
      const subject = 'E-mail de confirmação';
      const template = './email-confirmation';

      const mail = this.mailFactory(email, token, subject, template);

      await this.mailerService.sendMail(mail);
      return user;
    }
  }

  async signin(credentialsDto: CredentialsDto) {
    const user = await this.userRepository.checkCredentials(credentialsDto);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const jwtPayload = {
      id: user.id,
    };
    const token = await this.jwtService.sign(jwtPayload);

    return { token };
  }

  async confirmEmail(confirmationToken: string): Promise<void> {
    const { affected } = await this.userRepository.update(
      { confirmationToken },
      { confirmationToken: null },
    );

    if (!affected) {
      throw new NotFoundException('Token inválido!');
    }
  }

  async sendRecoverPasswordEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException(
        'Não há usuários cadastrados com esse e-mail!',
      );
    }

    user.recoverToken = randomBytes(32).toString('hex');
    await user.save();

    const { email: useremail, recoverToken: token } = user;
    const subject = 'Recuperação de senha';
    const template = './recover-password';

    const mail = this.mailFactory(useremail, token, subject, template);
    await this.mailerService.sendMail(mail);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { password, passwordConfirmation } = changePasswordDto;

    if (password !== passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    }

    await this.userRepository.changePassword(id, password);
  }

  async resetPassword(
    recoverToken: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne(
      { recoverToken },
      { select: ['id'] },
    );

    try {
      await this.changePassword(user.id.toString(), changePasswordDto);
    } catch (error) {
      throw error;
    }
  }
}
