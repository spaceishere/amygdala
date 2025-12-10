"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EpisodeSchema } from "@/lib/schemas";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createEpisode, updateEpisode } from "@/actions/episodes";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type EpisodeFormProps = {
  courseId: string;
  episode?: {
    id: string;
    title: string;
    description: string | null;
    order: number;
    isFreePreview: boolean;
    videoUrl: string | null;
    thumbnailUrl: string | null;
  };
  onSuccess: () => void;
};

export function EpisodeForm({
  courseId,
  episode,
  onSuccess,
}: EpisodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof EpisodeSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(EpisodeSchema) as any,
    defaultValues: {
      title: episode?.title || "",
      description: episode?.description || "",
      order: episode?.order || 0,
      isFreePreview: episode?.isFreePreview || false,
      videoUrl: episode?.videoUrl || undefined,
      thumbnailUrl: episode?.thumbnailUrl || undefined,
    },
  });

  // Update form if episode changes (e.g. reused component)
  useEffect(() => {
    if (episode) {
      form.reset({
        title: episode.title,
        description: episode.description || "",
        order: episode.order,
        isFreePreview: episode.isFreePreview,
        videoUrl: episode.videoUrl || undefined,
        thumbnailUrl: episode.thumbnailUrl || undefined,
      });
    }
  }, [episode, form]);

  async function onSubmit(values: z.infer<typeof EpisodeSchema>) {
    setIsLoading(true);
    try {
      if (episode) {
        await updateEpisode(episode.id, values);
      } else {
        await createEpisode(courseId, values);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        form.setValue("videoUrl", data.url);
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        form.setValue("thumbnailUrl", data.url);
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Episode Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Episode Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order (Sort Index)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Video File
          </label>
          <Input type="file" accept="video/*" onChange={handleVideoUpload} />
          {form.getValues("videoUrl") && (
            <p className="text-sm text-green-600 truncate">
              Video uploaded: {form.getValues("videoUrl")}
            </p>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Thumbnail Image
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
          />
          {form.getValues("thumbnailUrl") && (
            <p className="text-sm text-green-600 truncate">
              Thumbnail uploaded: {form.getValues("thumbnailUrl")}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="isFreePreview"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Free Preview</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {episode ? "Update Episode" : "Create Episode"}
        </Button>
      </form>
    </Form>
  );
}
