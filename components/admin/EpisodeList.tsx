"use client"

import { useState } from "react"
import { Episode } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EpisodeForm } from "./EpisodeForm"
import { deleteEpisode } from "@/actions/episodes"
import { useRouter } from "next/navigation"

type EpisodeListProps = {
  courseId: string
  initialEpisodes: Episode[]
}

export default function EpisodeList({ courseId, initialEpisodes }: EpisodeListProps) {
  const [episodes] = useState(initialEpisodes)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)
  const router = useRouter()

  // We could use optimistic updates or just router.refresh()
  // Since we pass initialEpisodes from server, router.refresh() will update them.

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure?")) return
      await deleteEpisode(id)
      router.refresh()
  }

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
           <Button onClick={() => setIsCreateOpen(true)}>
               <Plus className="mr-2 h-4 w-4" />
               Add Episode
           </Button>
       </div>

       <div className="space-y-2">
           {episodes.map((ep) => (
               <div key={ep.id} className="flex items-center justify-between p-4 bg-white border rounded shadow-sm">
                   <div className="flex items-center space-x-3">
                       <span className="font-mono text-slate-500">#{ep.order}</span>
                       <span className="font-semibold">{ep.title}</span>
                       {ep.isFreePreview && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Free Preview</span>}
                   </div>
                   <div className="flex space-x-2">
                       <Button size="sm" variant="outline" onClick={() => setEditingEpisode(ep)}>
                           <Edit className="h-4 w-4" />
                       </Button>
                       <Button size="sm" variant="destructive" onClick={() => handleDelete(ep.id)}>
                           <Trash className="h-4 w-4" />
                       </Button>
                   </div>
               </div>
           ))}
           {episodes.length === 0 && <p className="text-center text-slate-500 py-8">No episodes yet.</p>}
       </div>

       {/* Create Dialog */}
       <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
           <DialogContent className="max-w-lg">
               <DialogHeader>
                   <DialogTitle>Add New Episode</DialogTitle>
               </DialogHeader>
               <EpisodeForm 
                  courseId={courseId} 
                  onSuccess={() => {
                      setIsCreateOpen(false)
                      router.refresh()
                  }} 
                />
           </DialogContent>
       </Dialog>

       {/* Edit Dialog */}
       <Dialog open={!!editingEpisode} onOpenChange={(open) => !open && setEditingEpisode(null)}>
           <DialogContent className="max-w-lg">
               <DialogHeader>
                   <DialogTitle>Edit Episode</DialogTitle>
               </DialogHeader>
               {editingEpisode && (
                   <EpisodeForm 
                    courseId={courseId}
                    episode={editingEpisode}
                    onSuccess={() => {
                        setEditingEpisode(null)
                        router.refresh()
                    }}
                   />
               )}
           </DialogContent>
       </Dialog>
    </div>
  )
}
