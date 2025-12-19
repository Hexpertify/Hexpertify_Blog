"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import AdminNav from "@/components/admin/AdminNav";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Copy } from "lucide-react";

interface UploadedImage {
  url: string;
  name: string;
}

export default function AssetsPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      if (!data?.url) {
        throw new Error("Upload succeeded but no URL returned");
      }

      setUploadedImages((prev) => [{ url: data.url as string, name: file.name }, ...prev]);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setError(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Image URL copied to clipboard");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      alert("Failed to copy URL. Please copy manually.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
              <p className="text-gray-600 mt-2">
                Upload images once and reuse their URLs throughout the admin panel.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload new image</CardTitle>
                <CardDescription>
                  Select an image file to upload it to Supabase Storage via the upload API.
                  After upload, copy the URL and paste it anywhere in the admin forms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Button type="button" disabled className="flex items-center gap-2">
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Select file to upload"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Max file size: 10MB. Only image files are allowed. Upload starts automatically when you select a file.
                </p>
                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded this session</CardTitle>
                <CardDescription>
                  These images are not stored in a database; they are just a quick history for this browser session. The
                  URLs remain valid even after you leave this page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedImages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No images uploaded yet in this session. Upload an image above to generate a reusable URL.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {uploadedImages.map((img, index) => (
                      <div
                        key={`${img.url}-${index}`}
                        className="flex flex-col sm:flex-row gap-4 p-3 border rounded-lg bg-white"
                      >
                        <div className="relative w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={img.url}
                            alt={img.name}
                            title={img.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-sm font-medium text-gray-900 truncate" title={img.name}>
                            {img.name}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <Input
                              type="text"
                              readOnly
                              value={img.url}
                              className="text-xs"
                              onFocus={(e) => e.target.select()}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 whitespace-nowrap"
                              onClick={() => handleCopy(img.url)}
                            >
                              <Copy size={14} />
                              Copy URL
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
