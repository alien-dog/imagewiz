import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function ImageProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const processMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Failed to process image");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Image processed successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-w-full h-auto rounded"
                />
              ) : (
                <div className="py-8">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Drop your image here or click to upload
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Select Image
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {file.name}
                </span>
                <Button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            {processMutation.isPending ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Processing image...</p>
                <Progress value={33} className="w-full" />
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">
                  Ready to Process
                </h3>
                <Button
                  onClick={() => file && processMutation.mutate(file)}
                  disabled={!file}
                  className="w-full"
                >
                  Remove Background
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
