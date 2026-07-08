// Rishaad Bakers — auth helpers
// Uses NextAuth credentials provider with a SHA-256 password hash.
// (Sufficient for demo; production would use bcrypt/argon2 + a real DB user store.)

import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createHash } from 'crypto'
import { db } from '@/lib/db'

const SALT = 'rishaad-bakers-salt-v1'

export function hashPassword(password: string): string {
  return createHash('sha256').update(SALT + password).digest('hex')
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

        const hash = hashPassword(credentials.password)
        if (hash !== user.passwordHash) return null

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
