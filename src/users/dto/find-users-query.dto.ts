import { BaseQueryParameterDto } from '../../shared/dto/BaseQueryParameter.dto';

export class FindUsersQueryDto extends BaseQueryParameterDto {
  name: string;
  email: string;
  status: boolean;
  role: string;
}
