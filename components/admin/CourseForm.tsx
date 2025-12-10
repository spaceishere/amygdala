"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseSchema } from "@/lib/schemas";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createCourse, updateCourse } from "@/actions/courses";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// Extend schema for client-side validaton if needed
// CourseSchema expects string for thumbnailUrl, but input is file
// We handle file upload manually then update form data or call action with URL

type CourseFormProps = {
  course?: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    fakeEnrollmentBonus: number;
    isPublished: boolean;
    thumbnailUrl: string | null;
  };
};

export default function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof CourseSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CourseSchema) as any,
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      price: course?.price || 0,
      fakeEnrollmentBonus: course?.fakeEnrollmentBonus || 0,
      isPublished: course?.isPublished || false,
      thumbnailUrl: course?.thumbnailUrl || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof CourseSchema>) {
    setIsLoading(true);
    try {
      if (course) {
        // Update
        // If file was uploaded separately, how to handle?
        // For now, simpler: user uploads file via input, we upload to /api/upload, get URL, set in form.
        // Wait, I haven't implemented File Input logic in the form state yet.
        // I'll add a file input handler.

        const res = await updateCourse(course.id, values);
        if (res.error) {
          // handle error
        } else {
          router.push("/admin/courses");
        }
      } else {
        // Create
        const res = await createCourse(values);
        if (res.error) {
          // handle error
        } else {
          router.push("/admin/courses");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // File upload handler
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      console.log("Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-6 rounded shadow"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Course Title" {...field} />
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
                <Textarea placeholder="Course Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fakeEnrollmentBonus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fake Bonus Students</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Thumbnail Image
          </label>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {form.getValues("thumbnailUrl") && (
            <p className="text-sm text-green-600">
              Image uploaded: {form.getValues("thumbnailUrl")}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Published</FormLabel>
                <FormDescription>
                  This course will appear on the home page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Course
          </Button>
        </div>
      </form>
    </Form>
  );
}
