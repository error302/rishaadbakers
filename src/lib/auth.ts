// Rishaad Bakers — auth helpers
// Uses NextAuth credentials provider with bcrypt password hashing.
// Per agency-agents Backend Architect: defense in depth, least privilege.

import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findFirst({
          where: {
            email: credentials.email.toLowerCase(),
            deletedAt: null,
            role: 'ADMIN', // only admins may sign in to the dashboard
          },
        })
        if (!user) return null

        // Backward-compat: if the stored hash looks like a legacy SHA-256 hex
        // (64 chars, no $ prefix), reject and force a password reset.
        const isBcrypt = user.passwordHash.startsWith('$2')
        if (!isBcrypt) {
          console.warn(`User ${user.email} has legacy password hash — forcing reset`)
          return null
        }

        const valid = await verifyPassword(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
}

export async function getAuthSession() {
  return getServerSession(authOptions)
}

export async function requireAdmin() {
  const session = await getAuthSession()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return null
  }
  return session
}
