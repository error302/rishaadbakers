// Rishaad Bakers — middleware
// Protects all /admin/* routes except /admin/login.
// Per agency-agents Backend Architect pattern: defense in depth, least privilege.

export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/admin/((?!login).*)'],
}
