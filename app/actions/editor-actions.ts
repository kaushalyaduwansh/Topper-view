"use server";

import { db } from "@/db/drizzle";
import { mockQuestions, mockSections } from "@/db/schema";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { count, eq, and } from "drizzle-orm";

// --- 1. Create a Section ---
export async function createSectionAction(mockId: number, name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // Get next order
    const [current] = await db
      .select({ count: count() })
      .from(mockSections)
      .where(eq(mockSections.mockId, mockId));
    
    const [newSection] = await db.insert(mockSections).values({
      mockId,
      name,
      order: (current?.count || 0) + 1,
    }).returning();

    revalidatePath(`/dashboard/create-mock/${mockId}`);
    return { success: true, data: newSection };
  } catch (e) {
    console.error("Create Section Error:", e);
    return { success: false, error: "Failed to create section" };
  }
}

// --- 2. Save Question ---
export async function saveQuestionAction(data: {
  mockId: number;
  sectionId?: number; // Optional now
  questionHtml: string;
  options: any[];
  correctOption: string;
  solutionHtml: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // Determine the grouping for ordering (by Section if present, else by Mock)
    const whereClause = data.sectionId 
      ? and(eq(mockQuestions.mockId, data.mockId), eq(mockQuestions.sectionId, data.sectionId))
      : eq(mockQuestions.mockId, data.mockId);

    const [current] = await db
      .select({ count: count() })
      .from(mockQuestions)
      .where(whereClause);

    const nextOrder = (current?.count || 0) + 1;

    await db.insert(mockQuestions).values({
      mockId: data.mockId,
      sectionId: data.sectionId || null,
      questionHtml: data.questionHtml,
      options: data.options,
      correctOption: data.correctOption,
      solutionHtml: data.solutionHtml,
      order: nextOrder,
    });

    revalidatePath(`/dashboard/create-mock/${data.mockId}`);
    return { success: true, order: nextOrder };
  } catch (e) {
    console.error("Save Question Error:", e);
    return { success: false, error: "Database error while saving" };
  }
}