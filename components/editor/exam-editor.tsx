"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { MathExtension } from "@aarkue/tiptap-math-extension"; // New Math Ext
import "katex/dist/katex.min.css"; // Import CSS for Math

import { 
  Bold, Italic, List, ListOrdered, Image as ImageIcon, 
  Grid3X3, Save, Plus, CheckCircle2, Circle, 
  Sigma, Type, LayoutTemplate, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { createSectionAction, saveQuestionAction } from "@/app/actions/editor-actions";
import toast from "react-hot-toast";

// --- 1. Cloudinary Upload (Fixed & Debugged) ---
const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = "ml_default"; // HARDCODE your preset here if env fails, or use env

  if (!cloudName) throw new Error("Cloudinary Cloud Name not found in ENV");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset); 

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    
    if (!res.ok) {
        const err = await res.json();
        console.error("Cloudinary Error:", err);
        throw new Error(err.error?.message || "Upload failed");
    }
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Upload Logic Error:", error);
    throw error;
  }
};

// --- 2. Toolbar Component (With Math) ---
const EditorToolbar = ({ editor, addImage }: { editor: any; addImage: () => void }) => {
  if (!editor) return null;

  const addMath = () => {
    const latex = prompt("Enter LaTeX formula:", "E = mc^2");
    if (latex) {
      // @ts-ignore
      editor.chain().focus().setMath({ latex }).run();
    }
  };

  return (
    <div className="border-b bg-gray-50/50 p-2 flex items-center gap-1 flex-wrap sticky top-0 z-10">
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "bg-gray-200" : ""}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "bg-gray-200" : ""}>
        <Italic className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-2" />
      <Button variant="ghost" size="sm" onClick={addImage}>
        <ImageIcon className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addMath} title="Insert Math (LaTeX)">
        <Sigma className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Grid3X3 className="w-4 h-4" />
      </Button>
    </div>
  );
};

// --- 3. Option Editor (Toggle between Text/Rich) ---
const OptionItem = ({ id, content, setContent, isCorrect, setCorrect }: any) => {
  const [isRich, setIsRich] = useState(false);

  // Simple Input
  if (!isRich) {
    return (
      <div 
        className={`relative group border rounded-xl p-4 transition-all hover:shadow-md flex items-start gap-3
          ${isCorrect ? "border-green-500 bg-green-50/30" : "border-gray-200 bg-white"}`}
        onClick={setCorrect}
      >
        <div className="mt-1">{isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-300" />}</div>
        <div className="flex-1 space-y-2">
            <div className="flex justify-between">
                <span className="text-xs font-bold text-gray-500">Option {id}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); setIsRich(true); }}>
                    <Type className="w-3 h-3 text-gray-400" />
                </Button>
            </div>
            <textarea
                value={content.replace(/<[^>]*>?/gm, '')} // Strip HTML for simple view
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Type answer for Option ${id}...`}
                className="w-full text-sm bg-transparent border-none focus:ring-0 resize-none p-0 focus:outline-none"
                rows={2}
            />
        </div>
      </div>
    );
  }

  // Rich Input (Mini Editor)
  return (
    <div className={`relative border rounded-xl p-2 bg-white ring-2 ring-blue-100`}>
        <div className="flex justify-between mb-2">
            <span className="text-xs font-bold">Option {id} (Rich Text)</span>
            <Button variant="ghost" size="xs" onClick={() => setIsRich(false)}>Simple</Button>
        </div>
        {/* You would ideally render another Tiptap instance here, 
            but for performance, let's keep it simple or assume user switches back to text.
            For now, showing a textarea that accepts HTML raw string or a warning.
         */}
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs font-mono border rounded p-2 h-20"
        />
        <p className="text-[10px] text-gray-400 mt-1">Accepts HTML or switch back to Simple for plain text.</p>
    </div>
  );
};

// --- 4. Main Component ---
export default function ExamEditor({ mockId, existingSections = [] }: { mockId: number, existingSections?: any[] }) {
  const [sections, setSections] = useState<any[]>(existingSections);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(existingSections[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  
  // Question State
  const [correctOption, setCorrectOption] = useState("A");
  const [options, setOptions] = useState([
    { id: "A", html: "" }, { id: "B", html: "" }, { id: "C", html: "" }, { id: "D", html: "" },
  ]);

  // Main Editor Setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      TableKit.configure({ table: { resizable: true } }),
      MathExtension.configure({ evaluation: false }), // Math Support
    ],
    content: "",
    immediatelyRender: false, // Fix SSR Error
    editorProps: {
      attributes: { class: "prose prose-sm focus:outline-none min-h-[200px] p-4 max-w-none" },
    },
  });

  // Image Upload Logic
  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const toastId = toast.loading("Uploading...");
        try {
          const url = await uploadToCloudinary(file);
          editor?.chain().focus().setImage({ src: url }).run();
          toast.success("Uploaded!", { id: toastId });
        } catch (err: any) {
          console.error(err);
          toast.error(`Error: ${err.message}`, { id: toastId });
        }
      }
    };
    input.click();
  }, [editor]);

  // Save Logic
  const handleSave = async () => {
    if (!editor || !activeSectionId) {
        if(!activeSectionId) toast.error("Please create or select a section first!");
        return;
    }
    
    setIsSaving(true);
    try {
      const res = await saveQuestionAction({
        mockId,
        sectionId: activeSectionId,
        questionHtml: editor.getHTML(),
        options: options.map(o => ({ id: o.id, html: o.html || `<p>${o.html}</p>` })),
        correctOption,
        solutionHtml: "",
      });

      if (res.success) {
        toast.success(`Question ${res.order} Saved!`);
        // Reset
        editor.commands.clearContent();
        setOptions(options.map(o => ({ ...o, html: "" })));
        setCorrectOption("A");
        setQuestionCount((res.order || 0) + 1);
      } else {
        toast.error(res.error || "Failed to save");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // Create Section Logic
  const handleCreateSection = async (name: string) => {
    const res = await createSectionAction(mockId, name);
    if(res.success && res.data) {
        setSections([...sections, res.data]);
        setActiveSectionId(res.data.id);
        toast.success("Section Created");
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50/50">
      
      {/* LEFT SIDEBAR: Sections & Navigation */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Sections
            </h2>
        </div>
        
        {/* Section List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {sections.map(sec => (
                <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${activeSectionId === sec.id ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-600 hover:bg-gray-50"}`}
                >
                    {sec.name}
                </button>
            ))}
            
            {/* Add Section Button */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full border-dashed text-gray-500 gap-2">
                        <Plus className="w-4 h-4" /> Add Section
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Create New Section</DialogTitle>
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        handleCreateSection(e.target.name.value);
                    }} className="space-y-4 pt-4">
                        <Input name="name" placeholder="Section Name (e.g. English)" required />
                        <Button type="submit" className="w-full">Create</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        {/* Question Palette (Bottom Left) */}
        <div className="p-4 border-t bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Question Palette</h3>
            <div className="flex flex-wrap gap-2">
                {Array.from({length: questionCount}).map((_, i) => (
                    <div key={i} className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-bold
                        ${i+1 === questionCount ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600"}`}>
                        {i+1}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT MAIN AREA: Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 border-b bg-white flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <LayoutTemplate className="w-4 h-4" />
                <span>Editing: </span>
                <span className="font-bold text-gray-900">
                    {sections.find(s => s.id === activeSectionId)?.name || "Select a Section"}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => editor?.commands.clearContent()}>Clear</Button>
                <Button onClick={handleSave} disabled={isSaving || !activeSectionId} className="bg-green-600 hover:bg-green-700 gap-2">
                    {isSaving ? "Saving..." : "Save & Next"} <Save className="w-4 h-4" />
                </Button>
            </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-8">
            
            {/* Question Body */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Question Text</label>
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden focus-within:ring-2 ring-blue-500/20 transition-all">
                    <EditorToolbar editor={editor} addImage={handleImageUpload} />
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, idx) => (
                    <OptionItem 
                        key={opt.id}
                        id={opt.id}
                        content={opt.html}
                        setContent={(val: string) => {
                            const newOpts = [...options];
                            newOpts[idx].html = val;
                            setOptions(newOpts);
                        }}
                        isCorrect={correctOption === opt.id}
                        setCorrect={() => setCorrectOption(opt.id)}
                    />
                ))}
            </div>

        </div>
      </div>
    </div>
  );
}