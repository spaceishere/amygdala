import { db } from "@/lib/db"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default async function HomePage() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: { enrollments: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Master New Skills
            </h1>
            <p className="mt-4 text-lg text-slate-600">
                Explore our courses and start learning today.
            </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {courses.map((course: any) => {
                const realCount = course.enrollments.length
                const displayCount = realCount + course.fakeEnrollmentBonus

                return (
                    <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        {course.thumbnailUrl && (
                            <div className="relative h-48 w-full">
                                <Image 
                                  src={course.thumbnailUrl} 
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {course.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center text-sm text-slate-500 mb-2">
                                <Users className="mr-1 h-4 w-4" />
                                {displayCount} Students
                            </div>
                            <div className="text-lg font-bold text-slate-900">
                                {course.price === 0 ? "Free" : `$${course.price}`}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/courses/${course.slug}`} className="w-full">
                                <Button className="w-full">View Course</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )
            })}
            {courses.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                    No courses available yet. Check back soon!
                </div>
            )}
        </div>
      </main>
    </div>
  )
}
