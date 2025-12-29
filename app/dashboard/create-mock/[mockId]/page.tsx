import { notFound } from "next/navigation";
import { db } from "@/db/drizzle"; 
// 1. Add mockSections to the import
import { mockDetails, mockSections } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import ExamEditor from "@/components/editor/exam-editor";

interface PageProps {
  params: Promise<{ mockId: string }>;
}

export default async function CreateMockPage({ params }: PageProps) {
  const { mockId } = await params;
  const mockIdNum = Number(mockId); // Convert once

  // 2. Fetch Sections (Now mockSections is imported)
  const mockSectionsData = await db
    .select()
    .from(mockSections)
    .where(eq(mockSections.mockId, mockIdNum))
    .orderBy(asc(mockSections.order)); // Use 'asc' for cleaner sorting
  
  // 3. Fetch Mock Details
  const [mockData] = await db
    .select()
    .from(mockDetails)
    .where(eq(mockDetails.id, mockIdNum))    
    .limit(1);

  if (!mockData) {
    return notFound();
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Bar Info */}
      <header className="bg-white border-b px-6 py-3 shrink-0 flex items-center justify-between">
         <div className="flex items-center gap-4">
             <div className="bg-blue-100 text-blue-700 p-2 rounded-lg font-bold">
                 {mockData.examType}
             </div>
             <div>
                 <h1 className="font-bold text-gray-900 leading-tight">{mockData.testName}</h1>
                 <p className="text-xs text-gray-500">
                    ID: {mockId} • {mockData.examTime} Mins • {mockData.marksPerQuestion} Marks/Q
                 </p>
             </div>
         </div>
      </header>

      {/* Editor Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
         <ExamEditor mockId={mockIdNum} existingSections={mockSectionsData} />
      </main>
    </div>
  );
}