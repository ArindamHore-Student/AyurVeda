import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcrypt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db-adapter"

// @ts-ignore - Ignore adapter type mismatch
const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.picture,
          role: "PATIENT",
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        // @ts-ignore - We know role exists in our custom token
        session.user.role = token.role || 'PATIENT';
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // @ts-ignore - We know role exists in our custom user
        token.role = user.role || 'PATIENT';
      }
      return token
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Handle Google sign-in
        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (!existingUser && user.email) {
          // Create a new user account for Google sign-in
          try {
            await prisma.user.create({
              data: {
                name: user.name || 'Google User',
                email: user.email,
                image: user.image,
                passwordHash: '', // No password for OAuth users
                role: 'PATIENT',
                emailVerified: new Date(),
              },
            });
          } catch (error) {
            console.error("Error creating user from Google auth:", error);
            return false;
          }
        }
      }
      return true;
    },
    // Always redirect to dashboard after sign in
    async redirect({ url, baseUrl }) {
      // If the URL is an internal URL (starts with the base URL), respect that
      // Otherwise, redirect to dashboard
      if (url.startsWith(baseUrl)) {
        // If URL is just the base URL (e.g., homepage), redirect to dashboard
        if (url === baseUrl || url === `${baseUrl}/`) {
          return `${baseUrl}/dashboard`;
        }
        // Otherwise, respect any internal callback URL that was set
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})

export { handler as GET, handler as POST }

