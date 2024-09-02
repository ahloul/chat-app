import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Mocking the User type
interface User {
  id: string;
  username: string;
  password: string;
  email: string;
}

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const req = { user: { username: 'testuser' } };
      const result = { access_token: 'token' };
      jest.spyOn(authService, 'login').mockImplementation(async () => result);

      expect(await authController.login(req)).toBe(result);
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'testuser@test.com',
        username: 'testuser',
        password: 'testpass',
      };

      const result: User = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        email: 'testuser@example.com',
      };

      jest.spyOn(usersService, 'create').mockImplementation(async () => result);

      expect(await authController.register(createUserDto)).toBe(result);
    });
  });
});