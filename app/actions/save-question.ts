"use server";

import { db } from "@/db/drizzle";
import { mockQuestions } from "@/db/schema";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { count, eq } from "drizzle-orm";

export async function saveQuestionAction(data: {
  mockId: number;
  questionHtml: string;
  options: any[];
  correctOption: string;
  solutionHtml: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  // 1. Calculate order
  const [currentCount] = await db
    .select({ count: count() })
    .from(mockQuestions)
    .where(eq(mockQuestions.mockId, data.mockId));

  const nextOrder = (currentCount?.count || 0) + 1;

  // 2. Insert
  await db.insert(mockQuestions).values({
    mockId: data.mockId,
    questionHtml: data.questionHtml,
    options: data.options,
    correctOption: data.correctOption,
    solutionHtml: data.solutionHtml,
    order: nextOrder,
  });

  revalidatePath(`/dashboard/create-mock/${data.mockId}`);
  
  // 3. Return the order (CRITICAL)
  return { success: true, order: nextOrder };
}