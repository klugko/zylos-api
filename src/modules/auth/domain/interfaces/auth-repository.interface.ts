import { User } from '../entities/user.entity';

export interface AuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findAllActive(): Promise<User[]>;
  validateUser(email: string, password: string): Promise<User | null>;
  findPaginated(limit: number, page: number): Promise<{ items: User[]; total: number }>;
}
