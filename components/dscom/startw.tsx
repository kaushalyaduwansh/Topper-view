"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { CreateMockModal } from "@/components/dscom/create-mock-modal"; // Import the modal

export default function WelcomePage() {
  return (
    <main className=" bg-white flex flex-col items-center justify-center font-sans">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Welcome, Topper View
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Let&apos;s create your first assessment!
          <br />
          Pick the best way to begin.
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-5xl w-full ml-20 mr-20">
        
        {/* ================= Left Card (Assesly AI) ================= */}
        <div className="group relative bg-gradient-to-b from-[#EEEAFB] to-[#E6E0F9] rounded-[36px] overflow-hidden min-h-[450px] flex flex-col">
          {/* Illustration Placeholder (Purple) */}
          <div className="relative h-48 w-full mt-8 flex justify-center px-6">
            <div className="absolute top-0 w-3/4 h-full bg-white/50 rounded-t-3xl border-t-[6px] border-x-[6px] border-[#D9D2F5] translate-x-8"></div>
            <div className="relative w-3/4 h-full bg-white rounded-t-3xl shadow-sm p-4 flex items-start gap-3 -translate-x-2">
              <div className="h-12 w-12 bg-[#6C5CE7]/20 rounded-lg flex items-center justify-center">
                <div className="h-6 w-6 text-[#6C5CE7]">✨</div>
              </div>
              <div className="flex-1 space-y-2 mt-2">
                <div className="h-3 w-2/3 bg-[#6C5CE7]/20 rounded-full"></div>
                <div className="h-3 w-1/2 bg-[#6C5CE7]/20 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-white m-2 rounded-[28px] p-8 relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Build with Assesly AI
            </h2>
            <p className="text-gray-600 mb-8">
              Build a custom test from the ground up
            </p>
            
            {/* Wrap the button with the Modal */}
            <CreateMockModal>
              <Button
                className="w-full sm:w-auto bg-[#6C5CE7] hover:bg-[#5a4ad1] text-white font-medium py-6 px-6 rounded-xl text-base gap-2 transition-transform group-hover:-translate-y-1"
              >
                <IconPlus size={20} stroke={2.5} />
                Start with Assesly AI
              </Button>
            </CreateMockModal>
            
          </div>
        </div>

        {/* ================= Right Card (Template) ================= */}
        <div className="group relative bg-gradient-to-b from-[#EAF7FB] to-[#E0F2F9] rounded-[36px] overflow-hidden min-h-[450px] flex flex-col">
          {/* Illustration Placeholder (Blue) */}
          <div className="relative h-48 w-full mt-8 flex justify-center px-6">
            <div className="relative w-4/5 h-full bg-white/80 rounded-t-3xl border-t-[6px] border-x-[6px] border-[#CFEBF5] p-4 flex flex-col gap-4">
              <div className="h-4 w-1/3 bg-[#00B5E2]/30 rounded-full mx-auto mb-2"></div>
              <div className="h-16 w-full bg-[#00B5E2]/10 rounded-xl"></div>
              <div className="flex gap-3">
                <div className="h-12 w-1/3 bg-[#00B5E2]/10 rounded-xl"></div>
                <div className="h-12 w-1/3 bg-[#00B5E2]/10 rounded-xl"></div>
                <div className="h-12 w-1/3 bg-[#00B5E2]/10 rounded-xl"></div>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-white m-2 rounded-[28px] p-8 relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Choose a template
            </h2>
            <p className="text-gray-600 mb-8">
              Select from expert-curated templates
            </p>
            
            {/* Wrap the button with the Modal */}
            <CreateMockModal>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium py-6 px-6 rounded-xl text-base gap-2 transition-transform group-hover:-translate-y-1"
              >
                <IconPlus size={20} stroke={2} />
                Start with template
              </Button>
            </CreateMockModal>
            
          </div>
        </div>
      </div>
    </main>
  );
}