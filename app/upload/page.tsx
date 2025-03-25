"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic"; // Dynamically import ReactQuill
import DOMPurify from "dompurify"; // Import DOMPurify for sanitization
import "react-quill-new/dist/quill.snow.css"; // Import Quill styles
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function UploadBlog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("Blogs");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Function to clean HTML output
  const cleanHTML = (html: string) => {
    return DOMPurify.sanitize(html).replace(/<span class="ql-ui".*?<\/span>/g, "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description || !type || !author || !imageFile) {
      setError("All fields are required");
      return;
    }
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", cleanHTML(description)); // Clean description before saving
      formData.append("type", type);
      formData.append("author", author);
      formData.append("image", imageFile);

      const res = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        router.push("/");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F4FA]">
      {/* Hero Section */}
      <section className="pt-32 pb-0 px-6 bg-[#F2F4FA] clip-diagonal-bottom">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2A5CAA] mb-5">
            Upload a New Blog
          </h1>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg rounded-lg">
            {error && (
              <div className="mb-6 text-center text-red-600 font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5CAA]"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author Name
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5CAA]"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {/* Rich Text Editor */}
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  className="bg-white"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5CAA]"
                >
                  <option value="Blog">Blogs</option>
                  <option value="White Paper">White Papers</option>
                  <option value="Research paper">Our patents</option>
                </select>
              </div>
              <div className="mb-6">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full py-3 bg-[#2A5CAA] text-white font-semibold rounded-md hover:bg-[#1A4a9e] transition-colors"
              >
                Upload
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}
