import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createSampleData() {
  // Create admin user (if not exists)
  const adminEmail = "admin@example.com";
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  // Create sample course
  const course = await prisma.course.create({
    data: {
      title: "Complete Web Development Course",
      slug: "complete-web-development",
      description:
        "Learn modern web development from scratch with this comprehensive course covering HTML, CSS, JavaScript, React, and more.",
      price: 99.99,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
      fakeEnrollmentBonus: 150,
      isPublished: true,
    },
  });

  // Create sample episodes
  const episodes = [
    {
      title: "Introduction to Web Development",
      description:
        "Get started with the basics of web development and understand the landscape.",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517134191118-9d595e4c8c2a?w=400&h=225&fit=crop",
      order: 1,
      isFreePreview: true,
    },
    {
      title: "HTML Fundamentals",
      description:
        "Learn the building blocks of the web - HTML5 semantic markup.",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1522838199470-6e1b40b8c617?w=400&h=225&fit=crop",
      order: 2,
      isFreePreview: false,
    },
    {
      title: "CSS Styling and Layout",
      description: "Master CSS to create beautiful and responsive web layouts.",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
      order: 3,
      isFreePreview: false,
    },
  ];

  for (const episodeData of episodes) {
    await prisma.episode.create({
      data: {
        ...episodeData,
        courseId: course.id,
      },
    });
  }

  // Create a sample student user
  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Student User",
      passwordHash: password,
      role: "STUDENT",
    },
  });

  // Enroll the student in the course
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: "PAID",
    },
  });

  console.log("Sample data created successfully!");
  console.log(`Course: ${course.title}`);
  console.log(`Episodes: ${episodes.length}`);
  console.log(`Admin: ${admin.email}`);
  console.log(`Student: ${student.email}`);
}

createSampleData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
