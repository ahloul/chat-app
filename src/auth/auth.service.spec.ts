import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return a user if validation is successful', async () => {
      const user = { username: 'testuser', password: 'testpass' };
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(user);

      expect(await authService.validateUser('testuser', 'testpass')).toBe(user);
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);

      await expect(
        authService.validateUser('testuser', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { username: 'testuser', _id: '1' };
      const token = 'token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      expect(await authService.login(user)).toEqual({ access_token: token });
    });
  });
});
