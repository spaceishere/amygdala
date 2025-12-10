"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { enrollInCourse } from "@/actions/courses"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function EnrollButton({ courseId, price, isPublished }: { courseId: string, price: number, isPublished: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
      setIsLoading(true)
      try {
          const res = await enrollInCourse(courseId)
          if (res.error) {
              alert("Please login to enroll")
              router.push("/auth/login")
          } else {
              router.refresh()
          }
      } catch (err) {
          console.error(err)
      } finally {
          setIsLoading(false)
      }
  }

  if (!isPublished) return <Button disabled>Draft Course</Button>

  return (
    <Button size="lg" className="w-full md:w-auto" onClick={handleEnroll} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {price === 0 ? "Enroll for Free" : `Enroll for $${price}`}
    </Button>
  )
}
