"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createMockAction } from "@/app/actions/create-mock";

// Configuration for auto-filling marks
const EXAM_DEFAULTS = {
  SSC: { right: 2, wrong: 0.5 },
  Others: { right: 1, wrong: 0.25 },
};

interface CreateMockModalProps {
  children: React.ReactNode;
}

export function CreateMockModal({ children }: CreateMockModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [testName, setTestName] = useState("");
  const [examType, setExamType] = useState<"SSC" | "Others">("SSC");
  const [examTime, setExamTime] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [marksPerQuestion, setMarksPerQuestion] = useState(EXAM_DEFAULTS.SSC.right);
  const [negativeMarks, setNegativeMarks] = useState(EXAM_DEFAULTS.SSC.wrong);

  // Handle Exam Type Change & Auto-fill
  const handleExamTypeChange = (value: "SSC" | "Others") => {
    setExamType(value);
    const defaults = EXAM_DEFAULTS[value];
    if (defaults) {
      setMarksPerQuestion(defaults.right);
      setNegativeMarks(defaults.wrong);
      toast.success(`Marks updated for ${value}`, {
        icon: "⚡",
        style: { fontSize: "12px" },
      });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!testName.trim()) {
      toast.error("Test Name is required");
      return;
    }

    startTransition(async () => {
      try {
        // Prepare data object
        const formData = {
          testName,
          examType,
          examTime: Number(examTime),
          totalQuestions: Number(totalQuestions),
          marksPerQuestion: Number(marksPerQuestion),
          negativeMarks: Number(negativeMarks),
        };

        // Call Server Action
        await createMockAction(formData);
        
        // Success handling
        toast.success("Assessment created successfully!");
        setOpen(false);
        
        // Reset form (optional, as we redirect anyway)
        setTestName("");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create assessment. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
          <DialogDescription>
            Enter the details for your new mock test below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* 1. Test Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Test Name</Label>
            <Input
              placeholder="e.g. SSC CGL Full Mock 2025"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              required
              className="bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          {/* 2. Exam Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Exam Type</Label>
            <Select
              value={examType}
              onValueChange={(val) => handleExamTypeChange(val as "SSC" | "Others")}
            >
              <SelectTrigger className="bg-gray-50 focus:bg-white">
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SSC">SSC</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Exam Time */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Time (mins)
              </Label>
              <Input
                type="number"
                min={1}
                value={examTime}
                onChange={(e) => setExamTime(Number(e.target.value))}
                required
                className="bg-gray-50 focus:bg-white"
              />
            </div>

            {/* 4. Total Questions */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Total Questions
              </Label>
              <Input
                type="number"
                min={1}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                required
                className="bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Marking Scheme */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-green-700">
                Marks / Question
              </Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                value={marksPerQuestion}
                onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                required
                className="bg-green-50/50 border-green-200 focus:bg-white focus:border-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-red-600">
                Negative Marking
              </Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                required
                className="bg-red-50/50 border-red-200 focus:bg-white focus:border-red-400"
              />
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Marks have been auto-set based on the selected <strong>{examType}</strong> category. 
              You can manually override them if needed.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#6C5CE7] hover:bg-[#5a4ad1] text-white font-medium py-2 rounded-xl transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Assessment...
                </>
              ) : (
                "Create Assessment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}