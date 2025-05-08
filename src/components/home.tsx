import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Upload,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import ExamUploader from "./ExamUploader";
import ExamList from "./ExamList";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [activeTab, setActiveTab] = useState("exams");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fallback user data if auth user doesn't have all fields
  const displayUser = {
    name: user?.username || "User",
    email: user?.email || "user@example.com",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "User"}`,
    role: user?.role || "Examiner",
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-card p-4">
        <div className="flex items-center mb-8">
          <div className="rounded-md bg-primary p-2 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">ExamMark AI</h1>
        </div>

        <nav className="space-y-2">
          <Button
            variant={activeTab === "exams" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("exams")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
              <path d="M12 3v6" />
            </svg>
            Exams
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={displayUser.avatar}
                    alt={displayUser.name}
                  />
                  <AvatarFallback>{displayUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{displayUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {displayUser.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-4 gap-4">
            <div className="md:hidden">
              <Button variant="outline" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search exams..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="md:hidden">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeTab === "exams" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Exam Papers
                  </h1>
                  <p className="text-muted-foreground">
                    Manage and mark your exam papers
                  </p>
                </div>
                <ExamUploader onExamUploaded={() => setSearchQuery("")} />
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Exams</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">All</Badge>
                        <Badge>Pending</Badge>
                        <Badge variant="outline">In Progress</Badge>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      View and manage your exam papers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExamList searchQuery={searchQuery} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground">
                  View marking patterns and AI performance
                </p>
              </div>
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your account information
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">AI Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure AI marking behavior and thresholds
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your notification preferences
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
