import { supabaseAdmin } from '../config/supabase.js';
import { User } from '../types/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export class UserService {
  async createUser(email: string, password: string, name: string, role: string = 'customer'): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        name,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as User | null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as User | null;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (!userData) return null;

    const isValid = await comparePassword(password, userData.password_hash);
    return isValid ? user : null;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async getAllAgents(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'agent')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as User[];
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as User[];
  }
}

export const userService = new UserService();
