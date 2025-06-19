'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface Job {
  _id: string;
  jobId: string;
  title: string;
  location: string;
  type: string;
  datePosted: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          setJobs(jobs.filter(job => job.jobId !== jobId));
          toast.success('Job deleted successfully');
        } else {
          toast.error('Failed to delete job');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Error deleting job');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F2F4FA] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2A5CAA]">All Jobs</h1>
          <Link href="/job">
            <Button className="bg-[#2A5CAA] hover:bg-[#1a4a99] text-white">
              Create New Job
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Posted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.jobId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.datePosted).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Link href={`/jobs/edit/${encodeURIComponent(job.jobId)}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(job.jobId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {jobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}