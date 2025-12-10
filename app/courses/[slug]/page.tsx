import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import { Lock, CirclePlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { episodeId?: string };
}) {
  const session = await auth();

  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      episodes: {
        orderBy: { order: "asc" },
      },
      enrollments: {
        where: { userId: session?.user?.id },
      },
    },
  });

  if (!course) notFound();

  const isEnrolled = course.enrollments.length > 0;
  const realCount = await db.enrollment.count({
    where: { courseId: course.id },
  });
  const displayCount = realCount + course.fakeEnrollmentBonus;

  // Decide which episode to play
  // If searchParams.episodeId exists, verify access.
  // Else if enrolled, maybe auto-select first?
  // Else show overview.

  const activeEpisodeId = searchParams.episodeId;

  const activeEpisode = activeEpisodeId
    ? course.episodes.find((e: any) => e.id === activeEpisodeId) // eslint-disable-line @typescript-eslint/no-explicit-any
    : null;

  // Access check
  const canWatch = (episode: (typeof course.episodes)[0]) => {
    if (episode.isFreePreview) return true;
    if (isEnrolled) return true;
    return false;
  };

  const isLocked = activeEpisode && !canWatch(activeEpisode);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        {/* Header / Player Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {activeEpisode && !isLocked ? (
              <VideoPlayer
                videoUrl={activeEpisode.videoUrl}
                thumbnail={activeEpisode.thumbnailUrl}
                title={activeEpisode.title}
              />
            ) : (
              <div className="relative bg-slate-900 aspect-video rounded-lg flex flex-col items-center justify-center text-white p-6 text-center overflow-hidden">
                {activeEpisode ? (
                  <>
                    <Lock className="h-12 w-12 mb-4 text-slate-400" />
                    <h3 className="text-xl font-bold">Content Locked</h3>
                    <p className="text-slate-300 mb-4">
                      You must be enrolled to watch this episode.
                    </p>
                    {!isEnrolled && (
                      <EnrollButton
                        courseId={course.id}
                        price={course.price}
                        isPublished={course.isPublished}
                      />
                    )}
                  </>
                ) : (
                  // Course Overview / Thumbnail
                  <>
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover opacity-50"
                      />
                    ) : null}
                    <div className="relative z-10 p-8 max-w-lg bg-black/60 rounded backdrop-blur-sm">
                      <h1 className="text-3xl font-bold mb-2">
                        {course.title}
                      </h1>
                      <p className="text-lg text-slate-200 mb-6">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4">
                        {!isEnrolled && (
                          <EnrollButton
                            courseId={course.id}
                            price={course.price}
                            isPublished={course.isPublished}
                          />
                        )}
                        {isEnrolled && (
                          <div className="bg-green-600 text-white px-4 py-2 rounded font-medium">
                            Enrolled
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded shadow-sm">
              <h2 className="text-2xl font-bold mb-2">
                {activeEpisode ? activeEpisode.title : "Course Overview"}
              </h2>
              <p className="text-slate-600">
                {activeEpisode ? activeEpisode.description : course.description}
              </p>
            </div>
          </div>

          {/* Sidebar: Episode List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold text-lg mb-4">Course Content</h3>
              <div className="space-y-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {course.episodes.map((episode: any, index: number) => {
                  const isAccessible = canWatch(episode);
                  const isActive = activeEpisodeId === episode.id;

                  return (
                    <Link
                      key={episode.id}
                      href={`/courses/${course.slug}?episodeId=${episode.id}`}
                      className={cn(
                        "flex items-center p-3 rounded cursor-pointer transition-colors",
                        isActive
                          ? "bg-slate-100 border-l-4 border-blue-600"
                          : "hover:bg-slate-50",
                        !isAccessible && !isActive && "opacity-75"
                      )}
                    >
                      <div className="mr-3 text-slate-500 text-sm font-mono w-6 text-center">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            isActive && "text-blue-600"
                          )}
                        >
                          {episode.title}
                        </p>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          {episode.isFreePreview && (
                            <Badge
                              variant="secondary"
                              className="mr-2 text-[10px] px-1 py-0 h-5"
                            >
                              Free
                            </Badge>
                          )}
                          <span>Video</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {isAccessible ? (
                          <CirclePlay
                            className={cn(
                              "h-4 w-4",
                              isActive ? "text-blue-600" : "text-slate-400"
                            )}
                          />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </Link>
                  );
                })}
                {course.episodes.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    No episodes content yet.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-bold mb-2">Details</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Students Enrolled</span>
                  <span className="font-medium">{displayCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="font-medium">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
