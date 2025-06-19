/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "react-hot-toast";

type JobType = "Full Time" | "Part Time" | "Internship" | "Contract" | "Remote";

export default function EditJobForm() {
  const router = useRouter();
  const params = useParams();
  const jobId = decodeURIComponent(params.jobId as string);
  
  const [form, setForm] = useState({
    jobId: "",
    title: "",
    location: "",
    type: "Full Time" as JobType,
    datePosted: "",
    description: "",
    skills: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success) {
          const job = data.data;
          setForm({
            jobId: job.jobId,
            title: job.title,
            location: job.location,
            type: job.type,
            datePosted: new Date(job.datePosted).toISOString().split('T')[0],
            description: job.description,
            skills: job.skills.join(', '),
          });
        } else {
          toast.error(data.error || 'Failed to load job data');
        }
      } catch (error: any) {
        console.error('Fetch job error:', error);
        toast.error(`Error loading job: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const skillsArray = form.skills
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      jobId: form.jobId.trim(),
      title: form.title.trim(),
      location: form.location.trim(),
      type: form.type,
      datePosted: form.datePosted || new Date().toISOString().split('T')[0],
      description: form.description.trim(),
      skills: skillsArray,
    };

    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Job updated successfully!');
        router.push('/jobs');
      } else {
        toast.error(data.error || 'Failed to update job');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An error occurred while updating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F2F4FA] py-16 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#2A5CAA] mb-6">
          Edit Job
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="jobId">Job ID</Label>
            <Input
              id="jobId"
              name="jobId"
              value={form.jobId}
              onChange={handleChange}
              required
              readOnly
              className="mt-1 w-full bg-gray-100"
            />
          </div>

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

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2A5CAA] hover:bg-[#1a4a99] text-white flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin border-2 border-t-2 border-white rounded-full h-5 w-5"></div>
              ) : (
                "Update Job"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}