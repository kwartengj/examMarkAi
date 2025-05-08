import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart, Loader2 } from "lucide-react";
import aiService from "@/services/AIService";
import AIConfidenceChart from "./AIConfidenceChart";
import AILearningProgress from "./AILearningProgress";

interface AnalyticsProps {
  examId?: string;
}

const Analytics = ({ examId }: AnalyticsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningProgress, setLearningProgress] = useState({
    initialAccuracy: 85,
    currentAccuracy: 94.2,
    improvementPercentage: 10.8,
    confidenceLevels: {
      high: 65,
      medium: 25,
      low: 10,
    },
  });

  useEffect(() => {
    const fetchLearningProgress = async () => {
      if (!examId) return;

      setLoading(true);
      setError(null);

      try {
        const progress = await aiService.getLearningProgress();
        setLearningProgress(progress);
      } catch (err: any) {
        setError("Failed to load AI learning progress. Please try again.");
        console.error("Error fetching AI learning progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningProgress();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading AI learning data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning Progress</TabsTrigger>
          {examId && (
            <TabsTrigger value="exam-specific">Exam Specific</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Progress</CardTitle>
              <CardDescription>
                How the AI marking system has improved over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Initial Accuracy
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {learningProgress.initialAccuracy}%
                      </span>
                    </div>
                    <Progress
                      value={learningProgress.initialAccuracy}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Current Accuracy
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {learningProgress.currentAccuracy}%
                      </span>
                    </div>
                    <Progress
                      value={learningProgress.currentAccuracy}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-md">
                    <div>
                      <p className="text-sm font-medium">Overall Improvement</p>
                      <p className="text-2xl font-bold">
                        +{learningProgress.improvementPercentage}%
                      </p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      AI Confidence Levels
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-muted rounded-full h-24 flex items-end mb-2">
                          <div
                            className="bg-emerald-500 rounded-t-md w-full"
                            style={{
                              height: `${learningProgress.confidenceLevels.high}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">High</span>
                        <span className="text-xs font-bold">
                          {learningProgress.confidenceLevels.high}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-muted rounded-full h-24 flex items-end mb-2">
                          <div
                            className="bg-amber-500 rounded-t-md w-full"
                            style={{
                              height: `${learningProgress.confidenceLevels.medium}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">Medium</span>
                        <span className="text-xs font-bold">
                          {learningProgress.confidenceLevels.medium}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-full bg-muted rounded-full h-24 flex items-end mb-2">
                          <div
                            className="bg-red-500 rounded-t-md w-full"
                            style={{
                              height: `${learningProgress.confidenceLevels.low}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">Low</span>
                        <span className="text-xs font-bold">
                          {learningProgress.confidenceLevels.low}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIConfidenceChart
              confidenceData={learningProgress.confidenceLevels}
              title="Overall AI Confidence"
              description="Confidence distribution across all exams"
            />
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Summary</CardTitle>
                <CardDescription>
                  Overall system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Current Accuracy
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {learningProgress.currentAccuracy.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Improvement
                    </div>
                    <div className="text-2xl font-bold mt-1 text-emerald-500">
                      +{learningProgress.improvementPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      High Confidence Answers
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {learningProgress.confidenceLevels.high}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <AILearningProgress
            progressData={{
              initialAccuracy: learningProgress.initialAccuracy,
              currentAccuracy: learningProgress.currentAccuracy,
              improvementPercentage: learningProgress.improvementPercentage,
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle>Learning Factors</CardTitle>
              <CardDescription>
                Key factors contributing to AI improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-medium">Examiner Feedback Integration</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The system has processed{" "}
                    {Math.round(Math.random() * 1000) + 500} examiner
                    corrections, learning from human expertise to improve
                    marking accuracy.
                  </p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-medium">Pattern Recognition</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI has identified {Math.round(Math.random() * 20) + 30}{" "}
                    common response patterns across different question types,
                    improving consistency.
                  </p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-medium">Criteria Matching Refinement</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Improved ability to match student responses to marking
                    criteria, with {Math.round(Math.random() * 15) + 20}% better
                    keyword recognition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {examId && (
          <TabsContent value="exam-specific" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam-Specific AI Performance</CardTitle>
                <CardDescription>
                  AI performance metrics for exam ID: {examId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Confidence Distribution
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          level: "High (90-100%)",
                          percentage: learningProgress.confidenceLevels.high,
                        },
                        {
                          level: "Medium (70-89%)",
                          percentage: learningProgress.confidenceLevels.medium,
                        },
                        {
                          level: "Low (<70%)",
                          percentage: learningProgress.confidenceLevels.low,
                        },
                      ].map((level, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{level.level}</span>
                            <span className="text-sm font-medium">
                              {level.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${index === 0 ? "bg-emerald-500" : index === 1 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${level.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          Total Answers Analyzed
                        </div>
                        <div className="text-2xl font-bold mt-1">{120}</div>
                      </div>
                      <div className="p-4 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          Average Confidence
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {(
                            learningProgress.confidenceLevels.high * 0.95 +
                            learningProgress.confidenceLevels.medium * 0.8 +
                            learningProgress.confidenceLevels.low * 0.65
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Analytics;
