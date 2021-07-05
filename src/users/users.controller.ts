import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  Param,
  Patch,
  ForbiddenException,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { Role } from '../auth/role.decorator';
import { RolesGuard } from '../auth/role-guard.decorator';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from './user.entity';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Controller('users')
@UseGuards(AuthGuard(), RolesGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private userRepository: UserRepository,
  ) {}

  @Post()
  @Role(UserRole.ADMIN)
  async createAdminUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.usersService.createAdminUser(createUserDto);

    return {
      user,
      message: 'Adminstrador criado com sucesso!',
    };
  }

  @Get(':id')
  @Role(UserRole.ADMIN)
  async findUserById(@Param('id') id: string): Promise<ReturnUserDto> {
    const user = await this.usersService.findUserById(id);

    return {
      user,
      message: 'Usuário Encontrado!',
    };
  }

  @Patch(':id')
  async updateUser(
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    if (user.role !== UserRole.ADMIN && user.id.toString() !== id) {
      throw new ForbiddenException(
        'Você não tem autorização para acessar esse recurso!',
      );
    }

    return this.usersService.updateUser(updateUserDto, id);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);

    return {
      message: 'Usuário removido com sucesso!',
    };
  }

  @Get()
  @Role(UserRole.ADMIN)
  async findUsers(@Query() query: FindUsersQueryDto) {
    const found = await this.usersService.findUsers(query);

    return {
      found,
      message: 'Usuários encontrados!',
    };
  }
}
