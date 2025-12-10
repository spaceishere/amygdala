export const dynamic = "force-dynamic"

import { db } from "@/lib/db"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import EpisodeList from "@/components/admin/EpisodeList" // Client component for reordering/editing? Or server list + client modals.

export default async function CourseEpisodesPage({ params }: { params: { id: string } }) {
  
  const course = await db.course.findUnique({
    where: { id: params.id },
    include: { episodes: { orderBy: { order: "asc" } } }
  })

  if (!course) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </Link>
        <h1 className="text-2xl font-bold">Episodes for: {course.title}</h1>
      </div>
      
      {/* Pass episodes and courseId to a Client Component that handles Create/Edit/Delete/Reorder */}
      <EpisodeList courseId={course.id} initialEpisodes={course.episodes} />
    </div>
  )
}
