export const dynamic = "force-dynamic"

import { db } from "@/lib/db"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, Plus, Video } from "lucide-react"
import { deleteCourse } from "@/actions/courses"

export default async function CoursesPage() {
  // Layout validates admin, but double check doesn't hurt or trust layout.
  
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { enrollments: true }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students (Display)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No courses found.
                    </TableCell>
                </TableRow>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {courses.map((course: any) => {
              const realCount = course.enrollments.length
              const displayCount = realCount + course.fakeEnrollmentBonus
              
              return (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>
                    {course.isPublished ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{displayCount}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/courses/${course.id}/episodes`}>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-1" />
                        Episodes
                      </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* Delete form */}
                    <form action={async () => {
                        "use server"
                        await deleteCourse(course.id)
                    }} className="inline-block">
                        <Button size="sm" variant="destructive" type="submit">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </form>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
