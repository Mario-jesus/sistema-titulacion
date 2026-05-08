import type { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { AppError } from '@backend/shared';
import type { IUser } from './models/User.model.js';
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  PatchMeInput,
  ChangePasswordMeInput,
  ChangePasswordAdminInput,
} from './schemas/users.schemas.js';

const SALT_ROUNDS = 10;

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithAvatar extends UserPublic {
  avatar: string | null;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SORT_FIELDS = [
  'username',
  'email',
  'role',
  'createdAt',
  'lastLogin',
  'isActive',
] as const;

type UserDoc = {
  _id: { toString: () => string };
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserDocWithAvatar = UserDoc & { avatar: string | null };

function toUserPublic(doc: UserDoc): UserPublic {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    role: doc.role,
    isActive: doc.isActive,
    lastLogin: doc.lastLogin?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toUserWithAvatar(doc: UserDocWithAvatar): UserWithAvatar {
  return {
    ...toUserPublic(doc),
    avatar: doc.avatar ?? null,
  };
}

export class UsersService {
  constructor(private readonly userModel: Model<IUser>) {}

  async listUsers(
    params: ListUsersParams,
    query: Record<string, unknown>
  ): Promise<{ data: UserPublic[]; pagination: PaginationResult }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );
    const sortBy = params.sortBy ?? 'username';
    const sortByField = SORT_FIELDS.includes(
      sortBy as (typeof SORT_FIELDS)[number]
    )
      ? sortBy
      : 'username';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortByField]: sortOrder } as Record<string, 1 | -1>;

    const filter: Record<string, unknown> = {};
    if (params.activeOnly) filter.isActive = true;
    if (params.role) filter.role = params.role;
    if (params.search?.trim()) {
      const search = params.search.trim();
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => toUserPublic(d as UserDoc)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getUserById(id: string): Promise<UserPublic | null> {
    const user = await this.userModel
      .findById(id)
      .select('-password -avatar')
      .lean()
      .exec();
    return user ? toUserPublic(user as UserDoc) : null;
  }

  async createUser(input: CreateUserInput): Promise<UserPublic> {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();

    const existing = await this.userModel.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      ],
    });

    if (existing) {
      throw new AppError(409, 'DUPLICATE_ERROR', 'Username o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
      avatar: input.avatar ?? null,
      role: input.role,
      isActive: input.isActive,
    });

    const doc = await this.userModel
      .findById(user._id)
      .select('-password -avatar')
      .lean()
      .exec();
    return toUserPublic(doc as UserDoc);
  }

  async updateUser(
    id: string,
    input: UpdateUserInput,
    currentUserId?: string
  ): Promise<UserPublic> {
    const user = await this.userModel.findById(id);
    if (!user)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

    if (input.username !== undefined) {
      const existing = await this.userModel.findOne({
        username: { $regex: new RegExp(`^${input.username.trim()}$`, 'i') },
        _id: { $ne: id },
      });
      if (existing)
        throw new AppError(409, 'DUPLICATE_ERROR', 'Username ya existe');
      user.username = input.username.trim();
    }
    if (input.email !== undefined) {
      const existing = await this.userModel.findOne({
        email: input.email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing)
        throw new AppError(409, 'DUPLICATE_ERROR', 'Email ya existe');
      user.email = input.email.trim().toLowerCase();
    }
    if (input.role !== undefined) user.role = input.role;
    if (input.isActive !== undefined) user.isActive = input.isActive;

    await user.save();
    const doc = await this.userModel
      .findById(id)
      .select('-password -avatar')
      .lean()
      .exec();
    return toUserPublic(doc as UserDoc);
  }

  async patchMe(userId: string, input: PatchMeInput): Promise<UserWithAvatar> {
    const user = await this.userModel.findById(userId);
    if (!user)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

    if (input.username !== undefined) {
      const existing = await this.userModel.findOne({
        username: { $regex: new RegExp(`^${input.username.trim()}$`, 'i') },
        _id: { $ne: userId },
      });
      if (existing)
        throw new AppError(409, 'DUPLICATE_ERROR', 'Username ya existe');
      user.username = input.username.trim();
    }
    if (input.email !== undefined) {
      const existing = await this.userModel.findOne({
        email: input.email.trim().toLowerCase(),
        _id: { $ne: userId },
      });
      if (existing)
        throw new AppError(409, 'DUPLICATE_ERROR', 'Email ya existe');
      user.email = input.email.trim().toLowerCase();
    }
    if (input.avatar !== undefined) user.avatar = input.avatar;

    await user.save();
    const doc = await this.userModel
      .findById(userId)
      .select('-password')
      .lean()
      .exec();
    return toUserWithAvatar(doc as UserDocWithAvatar);
  }

  async deleteUser(id: string, currentUserId?: string): Promise<void> {
    if (currentUserId && id === currentUserId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'No puedes eliminarte a ti mismo'
      );
    }
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  async activateUser(id: string): Promise<UserPublic> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .select('-password -avatar')
      .lean()
      .exec();
    if (!user)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    return toUserPublic(user as UserDoc);
  }

  async deactivateUser(
    id: string,
    currentUserId?: string
  ): Promise<UserPublic> {
    if (currentUserId && id === currentUserId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'No puedes desactivarte a ti mismo'
      );
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .select('-password -avatar')
      .lean()
      .exec();
    if (!user)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    return toUserPublic(user as UserDoc);
  }

  async changePasswordMe(
    userId: string,
    input: ChangePasswordMeInput
  ): Promise<void> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

    const valid = await bcrypt.compare(input.currentPassword, user.password);
    if (!valid)
      throw new AppError(
        400,
        'INVALID_PASSWORD',
        'Contraseña actual incorrecta'
      );

    if (input.currentPassword === input.newPassword) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'La nueva contraseña debe ser diferente a la actual'
      );
    }

    user.password = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await user.save();
  }

  async changePasswordAdmin(
    id: string,
    input: ChangePasswordAdminInput,
    currentUserId?: string
  ): Promise<void> {
    if (currentUserId && id === currentUserId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Usa /users/me/change-password para cambiar tu propia contraseña'
      );
    }
    const user = await this.userModel.findById(id);
    if (!user)
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

    user.password = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await user.save();
  }
}
