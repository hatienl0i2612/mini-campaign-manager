import bcrypt from 'bcryptjs';
import { db } from '@/db/connection';
import type { AuthResponse } from '@mini-campaign-manager/shared';
import type { FastifyInstance } from 'fastify';

/**
 * Auth Service
 * Handles user registration, login, and JWT token generation.
 */
export class AuthService {
    /**
     * Register a new user
     */
    static async register(
        email: string,
        name: string,
        password: string,
        app: FastifyInstance,
    ): Promise<AuthResponse> {
        // Check if email already exists
        const existing = await db('users').where({ email }).first();
        if (existing) {
            throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
        }

        // Hash password & create user
        const password_hash = await bcrypt.hash(password, 12);
        const [user] = await db('users').insert({ email, name, password_hash }).returning('*');

        // Generate JWT
        const token = app.jwt.sign({ userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
            token,
        };
    }

    /**
     * Login an existing user
     */
    static async login(
        email: string,
        password: string,
        app: FastifyInstance,
    ): Promise<AuthResponse> {
        // Find user by email
        const user = await db('users').where({ email }).first();
        if (!user) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }

        // Generate JWT
        const token = app.jwt.sign({ userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
            token,
        };
    }

    /**
     * Get current user by ID (from JWT payload)
     */
    static async getMe(userId: string) {
        const user = await db('users').where({ id: userId }).first();
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 401 });
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
}
