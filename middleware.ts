import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")

  // Public Routes (list all public routes explicitly or by pattern)
  // Home, Course Details, etc.
  // We can just define PROTECTED routes instead.
  // Routes starting with /admin are ADMIN only.
  // Routes starting with /dashboard or player might be protected?
  // User req: "Other episodes show a lock... If logged in as STUDENT".
  // So /courses/[slug] is public, but specific actions inside might be gated.
  // /auth/* is public (but should redirect if logged in).

  const isAuthRoute = nextUrl.pathname.startsWith("/auth")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")

  if (isApiAuthRoute) {
    return null
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl))
    }
    return null
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/auth/login", nextUrl))
    }
    if (req.auth?.user.role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl))
    }
  }

  return null
})

// Matcher to restrict middleware to relevant paths
// Excluding static files, images, next internals
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
