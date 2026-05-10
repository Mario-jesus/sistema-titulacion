import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel } from '@backend/users/models/User.model';

const SALT_ROUNDS = 10;

type SeedUser = {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
};

function resolveAdminFromEnv(): SeedUser {
  const username = process.env.SEED_ADMIN_USERNAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  const anySet = Boolean(username || email || password);
  const allSet = Boolean(username && email && password);

  if (anySet && !allSet) {
    console.warn(
      'SEED_ADMIN_* incompleto: se requieren SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD. Se usará el admin de desarrollo por defecto.'
    );
  }

  if (allSet && username && email && password) {
    return {
      username,
      email,
      password,
      role: 'ADMIN',
      isActive: true,
    };
  }

  return {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'ADMIN',
    isActive: true,
  };
}

const SEED_USERS: SeedUser[] = [
  resolveAdminFromEnv(),
  {
    username: 'staff',
    email: 'staff@example.com',
    password: 'password123',
    role: 'STAFF',
    isActive: true,
  },
];

function requireEnvAdmin(): SeedUser {
  const username = process.env.SEED_ADMIN_USERNAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (!username || !email || !password) {
    throw new Error(
      'Definir SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env (apps/sistema-titulacion-servidor/.env).'
    );
  }
  return {
    username,
    email,
    password,
    role: 'ADMIN',
    isActive: true,
  };
}

async function upsertSeedUser(u: SeedUser): Promise<void> {
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

/**
 * Solo crea el usuario ADMIN definido en .env (SEED_ADMIN_*).
 * No crea staff ni usuarios de prueba. Falla si faltan variables.
 */
export async function seedAdminOnlyFromEnv(mongoUri: string): Promise<void> {
  const admin = requireEnvAdmin();
  await mongoose.connect(mongoUri);
  try {
    await upsertSeedUser(admin);
  } finally {
    await mongoose.disconnect();
  }
}

export async function seedUsers(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  try {
    for (const u of SEED_USERS) {
      await upsertSeedUser(u);
    }
  } finally {
    await mongoose.disconnect();
  }
}
