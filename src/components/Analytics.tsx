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
import { LineChart, BarChart, PieChart } from "lucide-react";
import aiService from "@/services/AIService";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Learning Progress</CardTitle>
          <CardDescription>
            How the AI marking system has improved over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">
                Loading AI learning data...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Initial Accuracy</span>
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
                  <span className="text-sm font-medium">Current Accuracy</span>
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
    </div>
  );
};

export default Analytics;
