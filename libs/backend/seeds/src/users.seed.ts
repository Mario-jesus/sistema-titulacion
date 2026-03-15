import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel } from '@backend/users/models/User.model';

const SALT_ROUNDS = 10;

const SEED_USERS = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'ADMIN' as const,
    isActive: true,
  },
  {
    username: 'staff',
    email: 'staff@example.com',
    password: 'password123',
    role: 'STAFF' as const,
    isActive: true,
  },
];

export async function seedUsers(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  for (const u of SEED_USERS) {
    const existing = await UserModel.findOne({
      $or: [
        { email: u.email.toLowerCase() },
        { username: { $regex: new RegExp(`^${u.username}$`, 'i') } },
      ],
    });

    if (!existing) {
      const hashed = await bcrypt.hash(u.password, SALT_ROUNDS);
      await UserModel.create({
        username: u.username,
        email: u.email.toLowerCase(),
        password: hashed,
        avatar: null,
        role: u.role,
        isActive: u.isActive,
      });
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  await mongoose.disconnect();
}
