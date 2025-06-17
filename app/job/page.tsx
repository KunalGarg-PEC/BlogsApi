// app/careers/admin/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "react-hot-toast";

type JobType = "Full Time" | "Part Time" | "Internship" | "Contract" | "Remote";

interface AdminFormState {
  jobId: string;
  title: string;
  location: string;
  type: JobType;
  datePosted: string; // yyyy-MM-dd
  description: string;
  skills: string; // comma-separated
}

export default function AdminJobForm() {
  const [form, setForm] = useState<AdminFormState>({
    jobId: "",
    title: "",
    location: "",
    type: "Full Time",
    datePosted: "",
    description: "",
    skills: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Split the comma-separated skills into an array
    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      jobId: form.jobId.trim(),
      title: form.title.trim(),
      location: form.location.trim(),
      type: form.type,
      datePosted: form.datePosted ? form.datePosted : undefined,
      description: form.description.trim(),
      skills: skillsArray,
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as {
        success: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?: any;
        error?: string;
      };

      if (res.ok && json.success) {
        // Show success toast
        toast.success("Job created successfully!");

        // Reset form fields
        setForm({
          jobId: "",
          title: "",
          location: "",
          type: "Full Time",
          datePosted: "",
          description: "",
          skills: "",
        });
      } else {
        // Show error toast
        toast.error(json.error || "Failed to create job. Please try again.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Create job error:", err);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4FA] mt-5 py-16 px-4 md:px-8 lg:px-12">
      {/* 1) Render the Toaster at the top-right of the screen */}
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#2A5CAA] mb-6">
          Create New Job
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job ID */}
          <div>
            <Label htmlFor="jobId">Job ID</Label>
            <Input
              id="jobId"
              name="jobId"
              value={form.jobId}
              onChange={handleChange}
              required
              className="mt-1 w-full"
              placeholder="e.g. frontend-1"
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1 w-full"
              placeholder="e.g. Frontend Engineer"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="mt-1 w-full"
              placeholder="e.g. Remote or Chandigarh, IN"
            />
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-[#2A5CAA] focus:ring focus:ring-[#2A5CAA]/50"
            >
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Contract</option>
              <option>Remote</option>
            </select>
          </div>

          {/* Date Posted */}
          <div>
            <Label htmlFor="datePosted">Date Posted</Label>
            <Input
              id="datePosted"
              name="datePosted"
              type="date"
              value={form.datePosted}
              onChange={handleChange}
              className="mt-1 w-full"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              className="mt-1 w-full"
              placeholder="Enter the full job description..."
            />
          </div>

          {/* Skills */}
          <div>
            <Label htmlFor="skills">Key Skills (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              placeholder="e.g. React, Next.js, Tailwind"
              value={form.skills}
              onChange={handleChange}
              className="mt-1 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter each skill separated by a comma. Example: React, Node.js, UX.
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2A5CAA] hover:bg-[#1a4a99] text-white flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin border-2 border-t-2 border-white rounded-full h-5 w-5"></div>
              ) : (
                "Create Job"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
