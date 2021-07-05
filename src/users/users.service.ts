import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      return this.userRepository.createUser(createUserDto, UserRole.ADMIN);
    }
  }

  async findUserById(userId: string): Promise<User> {
    const user: User = await this.userRepository.findOne(userId, {
      select: ['email', 'name', 'role', 'id'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return user;
  }

  async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
    const { affected } = await this.userRepository.update(
      { id },
      updateUserDto,
    );

    if (affected > 0) {
      const user = await this.findUserById(id);
      return user;
    }

    throw new NotFoundException('Usuário não encontrado');
  }

  async deleteUser(userId: string) {
    const result = await this.userRepository.delete({ id: userId });

    if (!result.affected) {
      throw new NotFoundException(
        'Não foi encontrado um usuário com o ID informado',
      );
    }
  }

  async findUsers(
    queryDto: FindUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.findUsers(queryDto);

    return users;
  }
}
