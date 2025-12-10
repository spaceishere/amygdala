import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { LoginSchema } from "@/lib/schemas"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await db.user.findUnique({
            where: { email },
          })

          if (!user || !user.passwordHash) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
          }
        }

        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
})
