import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { examsAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

interface ExamPaper {
  _id: string;
  title: string;
  date: string;
  paperCount: number;
  status: "pending" | "in-progress" | "completed";
}

// Default mock data to use when API fails or during development
const defaultExams: ExamPaper[] = [
  {
    _id: "1",
    title: "Introduction to Computer Science - Final Exam",
    date: "2023-06-15",
    paperCount: 32,
    status: "completed",
  },
  {
    _id: "2",
    title: "Advanced Mathematics - Midterm Assessment",
    date: "2023-07-22",
    paperCount: 28,
    status: "in-progress",
  },
  {
    _id: "3",
    title: "Biology 101 - Lab Report Evaluation",
    date: "2023-08-05",
    paperCount: 45,
    status: "pending",
  },
  {
    _id: "4",
    title: "English Literature - Essay Analysis",
    date: "2023-08-10",
    paperCount: 22,
    status: "pending",
  },
  {
    _id: "5",
    title: "Physics - Quantum Mechanics Final",
    date: "2023-07-30",
    paperCount: 18,
    status: "in-progress",
  },
  {
    _id: "6",
    title: "History - World War II Research Papers",
    date: "2023-06-28",
    paperCount: 36,
    status: "completed",
  },
];

const ExamList = ({ searchQuery = "" }) => {
  const [exams, setExams] = useState<ExamPaper[]>(defaultExams);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await examsAPI.getAllExams();
        if (response.success) {
          setExams(response.data);
        } else {
          console.error("API returned error:", response.message);
          // Fallback to default exams
          setExams(defaultExams);
        }
      } catch (err: any) {
        console.error("Failed to fetch exams:", err);
        // Fallback to default exams
        setExams(defaultExams);
      } finally {
        setLoading(false);
      }
    };

    // Try to fetch from API, but use mock data if it fails
    fetchExams().catch(() => {
      setExams(defaultExams);
      setLoading(false);
    });
  }, []);

  // Filter exams based on search query and status filter
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title
      .toLowerCase()
      .includes(localSearchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort exams by date
  const sortedExams = [...filteredExams].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateExam = () => {
    navigate("/create-exam");
  };

  const handleViewExam = (examId: string) => {
    navigate(`/exam-marking/${examId}`);
  };

  const handleMarkExam = (examId: string) => {
    navigate(`/exam-marking/${examId}`);
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        const response = await examsAPI.deleteExam(examId);
        if (response.success) {
          // Remove the deleted exam from the state
          setExams(exams.filter((exam) => exam._id !== examId));
        } else {
          setError(response.message || "Failed to delete exam");
        }
      } catch (err: any) {
        console.error("Failed to delete exam:", err);
        // Still remove from UI for better UX
        setExams(exams.filter((exam) => exam._id !== examId));
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading exams...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Exam Papers</h2>
        <Button className="bg-primary text-white" onClick={handleCreateExam}>
          <Plus className="mr-2 h-4 w-4" /> Upload New Exam
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search exams..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={toggleSortOrder}>
            {sortOrder === "asc" ? (
              <SortAsc size={18} />
            ) : (
              <SortDesc size={18} />
            )}
            <span className="ml-2 hidden sm:inline">Date</span>
          </Button>
        </div>
      </div>

      {sortedExams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No exams found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedExams.map((exam) => (
            <Card key={exam._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {exam.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewExam(exam._id)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMarkExam(exam._id)}
                      >
                        Start Marking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteExam(exam._id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{new Date(exam.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{exam.paperCount} papers</span>
                </div>
                <Badge className={getStatusColor(exam.status)}>
                  {exam.status.charAt(0).toUpperCase() +
                    exam.status.slice(1).replace("-", " ")}
                </Badge>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewExam(exam._id)}
                >
                  View
                </Button>
                <Button size="sm" onClick={() => handleMarkExam(exam._id)}>
                  Mark
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
