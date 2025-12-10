"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { EpisodeSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createEpisode(courseId: string, data: unknown) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const result = EpisodeSchema.safeParse(data)
  if (!result.success) return { error: "Invalid input" }

  try {
    const episode = await db.episode.create({
        data: {
            courseId,
            ...result.data
        }
    })
    revalidatePath(`/admin/courses/${courseId}/episodes`)
    return { success: true, episode }
  } catch (error) {
    return { error: "Failed to create episode" }
  }
}

export async function updateEpisode(id: string, data: unknown) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }
  
    const result = EpisodeSchema.safeParse(data)
    if (!result.success) return { error: "Invalid input" }
  
    try {
      await db.episode.update({
          where: { id },
          data: result.data
      })
      // find course to revalidate?
      // simplified revalidation
      return { success: true }
    } catch (error) {
      return { error: "Failed to update episode" }
    }
}

export async function deleteEpisode(id: string) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }

    try {
        await db.episode.delete({ where: { id } })
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete" }
    }
}
