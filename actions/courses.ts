"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { CourseSchema } from "@/lib/schemas"
import slugify from "slugify"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCourse(data: unknown) {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const result = CourseSchema.safeParse(data)
  if (!result.success) {
    return { error: "Invalid input" }
  }

  const { title, description, price, fakeEnrollmentBonus, isPublished, thumbnailUrl } = result.data

  const slug = slugify(title, { lower: true, strict: true })

  try {
    const course = await db.course.create({
      data: {
        title,
        slug,
        description,
        price,
        fakeEnrollmentBonus,
        isPublished,
        thumbnailUrl,
      },
    })
    
    revalidatePath("/admin/courses")
    return { success: true, course }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create course" }
  }
}

export async function updateCourse(id: string, data: unknown) {
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" }
    }
  
    const result = CourseSchema.safeParse(data)
    // Actually for update, partial might be allowed? But if form sends all, strict is okay.
    // Schema used in Create might be same for Update.
    if (!result.success) {
      return { error: "Invalid input" }
    }
  
    const { title, description, price, fakeEnrollmentBonus, isPublished, thumbnailUrl } = result.data
    
    try {
      await db.course.update({
        where: { id },
        data: {
            title,
            description,
            price,
            fakeEnrollmentBonus,
            isPublished,
            thumbnailUrl,
        }
      })
      
      revalidatePath(`/courses/[slug]`) // Cannot know slug easily if not fetched, but we can revalidate root or generic
      revalidatePath("/") // To update list on home
      return { success: true }
    } catch (error) {
      return { error: "Failed to update" }
    }
}

export async function deleteCourse(id: string) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" }

    try {
        await db.course.delete({ where: { id } })
        revalidatePath("/admin/courses")
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete" }
    }
}



export async function enrollInCourse(courseId: string) {
    const session = await auth()
    if (!session) return { error: "Unauthorized" }
    
    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId
            }
        }
    })
    
    if (existing) return { success: true }
    
    // Create enrollment
    try {
        await db.enrollment.create({
            data: {
                userId: session.user.id,
                courseId,
                status: "PAID" // Simulation
            }
        })
        revalidatePath(`/courses/[slug]`) // Cannot revalidate dynamic slug easily without knowing it, but we can revalidate path. 
        // Actually best to revalidate specific path.
        // We will just revalidate "/" and the specific course page in the component?
        // Or revalidate tag?
        // For now, simple revalidation.
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { error: "Failed to enroll" }
    }
}
