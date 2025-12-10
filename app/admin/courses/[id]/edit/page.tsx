export const dynamic = "force-dynamic"

import CourseForm from "@/components/admin/CourseForm"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const course = await db.course.findUnique({
    where: { id: params.id }
  })

  if (!course) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      {/* Pass course data to form */}
      <CourseForm course={course} />
    </div>
  )
}
