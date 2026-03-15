import type { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '@backend/shared';
import type { IUser } from '@backend/users/models/User.model.js';
import type { RefreshTokenStore } from './refresh-token-store.js';
import type { LoginInput, RefreshInput } from './schemas/auth.schemas.js';

export interface UserWithAvatar {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

function toUserWithAvatar(doc: {
  _id: { toString: () => string };
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): UserWithAvatar {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    avatar: doc.avatar ?? null,
    role: doc.role,
    isActive: doc.isActive,
    lastLogin: doc.lastLogin?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class AuthService {
  constructor(
    private readonly userModel: Model<IUser>,
    private readonly refreshTokenStore: RefreshTokenStore,
    private readonly jwtSecret: string,
    private readonly jwtAccessExpires: number,
    private readonly jwtRefreshExpires: number
  ) {}

  async login(
    input: LoginInput
  ): Promise<{ user: UserWithAvatar } & AuthTokens> {
    const email = input.email.trim().toLowerCase();

    const user = await this.userModel
      .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      .select('+password')
      .lean()
      .exec();

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Cuenta desactivada');
    }

    // Invalidate previous refresh token (rotation)
    await this.refreshTokenStore.delete(user._id.toString());

    // Update lastLogin
    await this.userModel
      .findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .exec();

    const tokens = this.generateTokens(user._id.toString());
    await this.refreshTokenStore.set(user._id.toString(), tokens.refreshToken);

    const userDoc = await this.userModel
      .findById(user._id)
      .select('-password')
      .lean()
      .exec();

    return {
      user: toUserWithAvatar(userDoc as Parameters<typeof toUserWithAvatar>[0]),
      ...tokens,
    };
  }

  async refresh(input: RefreshInput): Promise<AuthTokens> {
    let payload: { userId: string };
    try {
      payload = jwt.verify(input.refreshToken, this.jwtSecret) as {
        userId: string;
      };
    } catch {
      throw new AppError(
        401,
        'INVALID_REFRESH_TOKEN',
        'Refresh token inválido'
      );
    }

    if (
      !(await this.refreshTokenStore.has(payload.userId, input.refreshToken))
    ) {
      throw new AppError(
        401,
        'INVALID_REFRESH_TOKEN',
        'Refresh token inválido'
      );
    }

    const user = await this.userModel
      .findById(payload.userId)
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      await this.refreshTokenStore.delete(payload.userId);
      throw new AppError(
        401,
        'INVALID_REFRESH_TOKEN',
        'Refresh token inválido'
      );
    }

    if (!user.isActive) {
      await this.refreshTokenStore.delete(payload.userId);
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Cuenta desactivada');
    }

    // Invalidate used refresh token
    await this.refreshTokenStore.delete(payload.userId);

    const tokens = this.generateTokens(payload.userId);
    await this.refreshTokenStore.set(payload.userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId?: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, this.jwtSecret) as {
          userId: string;
        };
        if (await this.refreshTokenStore.has(payload.userId, refreshToken)) {
          await this.refreshTokenStore.delete(payload.userId);
        }
      } catch {
        // Token invalid or expired, nothing to invalidate
      }
    }
    if (userId) {
      await this.refreshTokenStore.delete(userId);
    }
  }

  async getMe(userId: string): Promise<UserWithAvatar> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'No autenticado');
    }

    return toUserWithAvatar(user as Parameters<typeof toUserWithAvatar>[0]);
  }

  validateAccessToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as {
        userId: string;
      };
      return { userId: payload.userId };
    } catch {
      return null;
    }
  }

  private generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtAccessExpires,
    });
    const refreshToken = jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtRefreshExpires,
    });
    return {
      token: accessToken,
      refreshToken,
      expiresIn: this.jwtAccessExpires,
    };
  }
}
