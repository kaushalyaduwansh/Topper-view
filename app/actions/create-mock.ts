"use server";

import { db } from "@/db/drizzle";
import { mockDetails } from "@/db/schema";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema for server-side validation
const createMockSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  examType: z.enum(["SSC", "Others"]),
  examTime: z.number().min(1),
  totalQuestions: z.number().min(1),
  marksPerQuestion: z.number().min(0),
  negativeMarks: z.number().min(0),
});

export type CreateMockValues = z.infer<typeof createMockSchema>;

export async function createMockAction(data: CreateMockValues) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Validate data on the server
  const validation = createMockSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("Invalid data provided");
  }

  const { testName, examType, examTime, totalQuestions, marksPerQuestion, negativeMarks } = validation.data;

  // Insert into DB
  const [newMock] = await db
    .insert(mockDetails)
    .values({
      userId: session.user.id,
      testName,
      examType,
      examTime,
      totalQuestions,
      marksPerQuestion: String(marksPerQuestion),
      negativeMarks: String(negativeMarks),
    })
    .returning({ id: mockDetails.id });

  // Redirect
  redirect(`/dashboard/create-mock/${newMock.id}`);
}