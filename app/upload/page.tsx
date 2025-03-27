"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "./editor-styles.css";

const ReactQuill = dynamic(() => import("./ReactQuillWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  ),
});

export default function UploadBlog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("Blogs");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editorModules = useMemo(
    () => ({
      table: true,
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "table"],
          [{ align: [] }],
          ["clean"],
        ],
        handlers: {
          image: () => {
            fileInputRef.current?.click();
          },
        },
      },
    }),
    []
  );

  const editorFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "table",
    "align",
  ];

  const cleanHTML = (html: string) => {
    return DOMPurify.sanitize(html)
      .replace(/<span class="ql-ui".*?<\/span>/g, "")
      .replace(/<img[^>]+>/g, (match) => {
        return match.replace(/style="[^"]*"/, 'class="ql-image"');
      });
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
      formData.append("description", cleanHTML(description));
      formData.append("type", type);
      formData.append("author", author);
      formData.append("image", imageFile);

      const res = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.success) {
        router.push("/");
      } else {
        setError(data.error || "Something went wrong");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F4FA]">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={async (e) => {
          if (e.target.files?.[0]) {
            const file = e.target.files[0];
            try {
              const quill = quillRef.current?.getEditor();
              const range = quill.getSelection();

              const formData = new FormData();
              formData.append("image", file);

              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              if (!res.ok) throw new Error("Upload failed");

              const { url } = await res.json();
              quill.insertEmbed(range?.index || 0, "image", url);
              quill.setSelection((range?.index || 0) + 1);
              quill.focus();
            } catch (error) {
              console.error("Image upload failed:", error);
              alert("Image upload failed. Please try again.");
            } finally {
              if (e.target) e.target.value = "";
            }
          }
        }}
      />

      <section className="pt-32 pb-0 px-6 bg-[#F2F4FA] clip-diagonal-bottom">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2A5CAA] mb-5">
            Upload a New Blog
          </h1>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg rounded-lg">
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <div className="relative h-[500px]">
                  <ReactQuill
                    ref={quillRef}
                    value={description}
                    onChange={setDescription}
                    theme="snow"
                    className="bg-white h-full rounded-lg overflow-hidden"
                    modules={editorModules}
                    formats={editorFormats}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5CAA]"
                >
                  <option value="Blogs">Blogs</option>
                  <option value="White Papers">White Papers</option>
                  <option value="Our Patents">Our Patents</option>
                </select>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Featured Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  required
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2A5CAA] file:text-white hover:file:bg-[#1A4a9e]"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-[#2A5CAA] text-white font-semibold rounded-md hover:bg-[#1A4a9e] transition-colors"
              >
                Publish Blog
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}