/**
 * Authentication Middleware
 * 
 * This middleware protects routes that require authentication by checking for a valid session token.
 * It intercepts requests to protected paths and redirects unauthenticated users to the login page.
 * 
 * Features:
 * - Path-based protection with regex pattern matching
 * - Preserves the original URL as a callback after successful login
 * - Implements performance optimizations to minimize token verification overhead
 * - Handles public and protected routes efficiently
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define protected paths using a more efficient regex pattern
const PROTECTED_PATH_PATTERN = /^\/dashboard(\/.*)?$|^\/profile(\/.*)?$/

// Define paths that should be accessible without authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth',
  '/',
  '/about',
  '/favicon.ico',
  '/_next',
]

/**
 * Check if a path should be publicly accessible
 * @param path - The URL path to check
 * @returns boolean indicating if the path is public
 */
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public paths to improve performance
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check if the path matches protected pattern
  const isProtectedPath = PROTECTED_PATH_PATTERN.test(pathname)
  
  if (isProtectedPath) {
    // Get the authentication token from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      
      // Preserve the original URL for redirection after login
      loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
      
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}

