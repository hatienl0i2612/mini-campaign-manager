/**
 * User-related type definitions
 */

export interface User {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

/** User without sensitive fields — safe for API responses */
export type UserPublic = Omit<User, 'password_hash'>;

export interface AuthTokenPayload {
    userId: string;
    email: string;
}

export interface AuthResponse {
    user: UserPublic;
    token: string;
}
