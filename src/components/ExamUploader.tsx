import React, { useState } from "react";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { examsAPI } from "@/lib/api";

interface MarkingCriterion {
  id: string;
  description: string;
  maxScore: number;
}

interface ExamUploaderProps {
  onExamUploaded?: () => void;
}

const ExamUploader = ({ onExamUploaded }: ExamUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [markingCriteria, setMarkingCriteria] = useState<MarkingCriterion[]>([
    { id: "1", description: "", maxScore: 10 },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addCriterion = () => {
    setMarkingCriteria([
      ...markingCriteria,
      { id: Date.now().toString(), description: "", maxScore: 10 },
    ]);
  };

  const removeCriterion = (id: string) => {
    if (markingCriteria.length > 1) {
      setMarkingCriteria(markingCriteria.filter((c) => c.id !== id));
    }
  };

  const updateCriterion = (
    id: string,
    field: "description" | "maxScore",
    value: string | number,
  ) => {
    setMarkingCriteria(
      markingCriteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!title.trim()) {
      setError("Please enter an exam title");
      return;
    }

    if (!selectedFile) {
      setError("Please select an exam file");
      return;
    }

    // Validate marking criteria
    const invalidCriteria = markingCriteria.some(
      (c) => !c.description.trim() || c.maxScore <= 0,
    );
    if (invalidCriteria) {
      setError(
        "Please ensure all marking criteria have descriptions and positive scores",
      );
      return;
    }

    try {
      setIsUploading(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", selectedFile);
      formData.append("markingCriteria", JSON.stringify(markingCriteria));

      // Upload exam
      const response = await examsAPI.uploadExam(formData);

      if (response.success) {
        // Reset form
        setTitle("");
        setSelectedFile(null);
        setMarkingCriteria([{ id: "1", description: "", maxScore: 10 }]);
        setIsOpen(false);

        // Notify parent component
        if (onExamUploaded) {
          onExamUploaded();
        }
      } else {
        setError(response.message || "Failed to upload exam");
      }
    } catch (err: any) {
      console.error("Error uploading exam:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white">
          <Upload className="mr-2 h-4 w-4" /> Upload New Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Exam</DialogTitle>
          <DialogDescription>
            Upload an exam paper and define marking criteria
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to Computer Science - Final Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Exam File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate max-w-[400px]">
                      {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOCX, or image files (max 10MB)
                    </p>
                  </div>
                )}
                <Input
                  id="file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => document.getElementById("file")?.click()}
              >
                Select File
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Marking Criteria</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCriterion}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Criterion
                </Button>
              </div>

              <div className="space-y-3">
                {markingCriteria.map((criterion) => (
                  <Card key={criterion.id}>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between">
                          <Label htmlFor={`desc-${criterion.id}`}>
                            Description
                          </Label>
                          {markingCriteria.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCriterion(criterion.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          id={`desc-${criterion.id}`}
                          placeholder="e.g. Correct application of formula"
                          value={criterion.description}
                          onChange={(e) =>
                            updateCriterion(
                              criterion.id,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`score-${criterion.id}`}>
                            Max Score:
                          </Label>
                          <Input
                            id={`score-${criterion.id}`}
                            type="number"
                            min="1"
                            max="100"
                            className="w-20"
                            value={criterion.maxScore}
                            onChange={(e) =>
                              updateCriterion(
                                criterion.id,
                                "maxScore",
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamUploader;
