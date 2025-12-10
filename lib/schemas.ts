import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export const CourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  fakeEnrollmentBonus: z.coerce.number().min(0, "Bonus must be non-negative"),
  isPublished: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
});

export const EpisodeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  order: z.coerce.number().default(0),
  isFreePreview: z.boolean().default(false),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});
