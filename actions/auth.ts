"use server"

import { db } from "@/lib/db"
import { RegisterSchema } from "@/lib/schemas"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function registerUser(data: z.infer<typeof RegisterSchema>) {
  const result = RegisterSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid input" }
  }

  const { email, password, name } = result.data

  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "STUDENT",
    },
  })

  return { success: true }
}
