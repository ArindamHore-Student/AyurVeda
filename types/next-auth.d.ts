import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the JWT payload
   */
  interface JWT {
    role?: string
  }
} 