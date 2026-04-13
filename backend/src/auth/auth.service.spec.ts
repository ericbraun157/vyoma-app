import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('verifies OTP and returns access token', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('test.jwt.token'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
                id: 'u1',
                mobile: '9876543210',
                role: 'owner',
                displayName: null,
              }),
            },
          },
        },
      ],
    }).compile();

    const auth = moduleRef.get(AuthService);
    await auth.requestOtp('9876543210');
    const res = await auth.verifyOtp('9876543210', '1234');
    expect(res.accessToken).toBeTruthy();
    expect(res.user.mobile).toBe('9876543210');
  });
});

