import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Users,
  Brain,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsDashboardProps {
  examData?: {
    totalExams: number;
    completedExams: number;
    pendingExams: number;
    averageScore: number;
    markingAccuracy: number;
    commonMistakes: Array<{ mistake: string; frequency: number }>;
    aiConfidence: Array<{ level: string; percentage: number }>;
    markingTrends: Array<{ date: string; accuracy: number; papers: number }>;
  };
}

const AnalyticsDashboard = ({
  examData = {
    totalExams: 120,
    completedExams: 78,
    pendingExams: 42,
    averageScore: 72.5,
    markingAccuracy: 94.2,
    commonMistakes: [
      { mistake: "Incorrect formula application", frequency: 42 },
      { mistake: "Missing key concepts", frequency: 38 },
      { mistake: "Incomplete explanations", frequency: 27 },
      { mistake: "Calculation errors", frequency: 23 },
      { mistake: "Misinterpreted question", frequency: 18 },
    ],
    aiConfidence: [
      { level: "High (90-100%)", percentage: 65 },
      { level: "Medium (70-89%)", percentage: 25 },
      { level: "Low (<70%)", percentage: 10 },
    ],
    markingTrends: [
      { date: "Jan", accuracy: 88, papers: 15 },
      { date: "Feb", accuracy: 90, papers: 18 },
      { date: "Mar", accuracy: 91, papers: 22 },
      { date: "Apr", accuracy: 93, papers: 25 },
      { date: "May", accuracy: 94, papers: 20 },
      { date: "Jun", accuracy: 94.2, papers: 20 },
    ],
  },
}: AnalyticsDashboardProps) => {
  return (
    <div className="bg-background p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
              <SelectItem value="last6months">Last 6 months</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <h3 className="text-2xl font-bold mt-1">
                  {examData.totalExams}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-emerald-500">
                <span className="font-medium">
                  {Math.round(
                    (examData.completedExams / examData.totalExams) * 100,
                  )}
                  % complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <h3 className="text-2xl font-bold mt-1">
                  {examData.averageScore}%
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-emerald-500">
                <span className="font-medium">+2.5% from last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  AI Marking Accuracy
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {examData.markingAccuracy}%
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Brain className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-emerald-500">
                <span className="font-medium">+1.2% from last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Examiner Overrides
                </p>
                <h3 className="text-2xl font-bold mt-1">12%</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-emerald-500">
                <span className="font-medium">-3.8% from last period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="marking-patterns" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="marking-patterns">Marking Patterns</TabsTrigger>
          <TabsTrigger value="student-mistakes">Student Mistakes</TabsTrigger>
          <TabsTrigger value="ai-confidence">AI Confidence</TabsTrigger>
        </TabsList>

        <TabsContent value="marking-patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marking Accuracy Over Time</CardTitle>
              <CardDescription>
                AI marking accuracy compared to examiner corrections
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              {/* Placeholder for chart - would use a real chart library in production */}
              <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex justify-between px-4 pt-4">
                    {examData.markingTrends.map((point, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="bg-primary w-2 rounded-full"
                          style={{ height: `${point.accuracy * 2}px` }}
                        />
                        <span className="text-xs mt-2">{point.date}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 flex items-end justify-center">
                    <LineChart className="h-40 w-40 text-muted-foreground opacity-20" />
                  </div>
                </div>
                <p className="text-muted-foreground z-10">
                  Chart visualization would appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Papers Marked Per Period</CardTitle>
                <CardDescription>
                  Number of papers processed by the system
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-4 pb-10">
                    {examData.markingTrends.map((point, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="bg-primary/70 w-10 rounded-t-md"
                          style={{ height: `${point.papers * 4}px` }}
                        />
                        <span className="text-xs mt-2">{point.date}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground z-10">
                    Chart visualization would appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marking Efficiency</CardTitle>
                <CardDescription>
                  Time spent per paper compared to accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Chart visualization would appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="student-mistakes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Student Mistakes</CardTitle>
              <CardDescription>
                Most frequent errors identified in student responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {examData.commonMistakes.map((mistake, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {mistake.mistake}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {mistake.frequency} occurrences
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${(mistake.frequency / examData.commonMistakes[0].frequency) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mistake Distribution by Topic</CardTitle>
                <CardDescription>
                  How mistakes are distributed across exam topics
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-32 w-32">
                      <div
                        className="absolute inset-0 rounded-full border-8 border-primary/70"
                        style={{
                          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                        }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border-8 border-blue-400/70"
                        style={{
                          clipPath: "polygon(0 0, 60% 0, 60% 60%, 0% 60%)",
                        }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border-8 border-amber-400/70"
                        style={{
                          clipPath: "polygon(60% 0, 100% 0, 100% 40%, 60% 40%)",
                        }}
                      ></div>
                    </div>
                  </div>
                  <PieChart className="h-40 w-40 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground z-10">
                    Chart visualization would appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Opportunities</CardTitle>
                <CardDescription>
                  Areas where teaching could be enhanced
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-muted/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        Formula Application
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        42% of students struggle with correctly applying
                        mathematical formulas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-muted/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        Key Concept Identification
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        38% of students miss identifying key concepts in their
                        responses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-muted/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        Explanation Completeness
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        27% of students provide incomplete explanations for
                        their answers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-confidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Confidence Levels</CardTitle>
              <CardDescription>
                How confident the AI is in its marking decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-around px-10 pb-10">
                  {examData.aiConfidence.map((level, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-32 rounded-t-md ${i === 0 ? "bg-emerald-500/70" : i === 1 ? "bg-amber-500/70" : "bg-red-500/70"}`}
                        style={{ height: `${level.percentage * 2.5}px` }}
                      />
                      <span className="text-xs mt-2 text-center">
                        {level.level}
                      </span>
                      <span className="text-xs font-bold">
                        {level.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground z-10">
                  Chart visualization would appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Learning Progress</CardTitle>
                <CardDescription>
                  How the AI has improved over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center">
                  <div className="w-full px-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            Initial Training
                          </span>
                          <span className="text-sm text-muted-foreground">
                            85%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            After 1 Month
                          </span>
                          <span className="text-sm text-muted-foreground">
                            89%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: "89%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            After 3 Months
                          </span>
                          <span className="text-sm text-muted-foreground">
                            92%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: "92%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Current</span>
                          <span className="text-sm text-muted-foreground">
                            94.2%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: "94.2%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence by Question Type</CardTitle>
                <CardDescription>
                  AI confidence levels across different question formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Multiple Choice</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">98%</span>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Short Answer</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">92%</span>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Problem Solving</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">87%</span>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Essay</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">78%</span>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Open-ended Discussion</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">65%</span>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
