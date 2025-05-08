import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface AILearningProgressProps {
  progressData?: {
    initialAccuracy: number;
    currentAccuracy: number;
    improvementPercentage: number;
  };
}

const AILearningProgress = ({
  progressData = {
    initialAccuracy: 85,
    currentAccuracy: 94.2,
    improvementPercentage: 10.8,
  },
}: AILearningProgressProps) => {
  const stages = [
    { name: "Initial Training", value: progressData.initialAccuracy },
    {
      name: "After 1 Month",
      value:
        progressData.initialAccuracy + progressData.improvementPercentage / 3,
    },
    {
      name: "After 3 Months",
      value:
        progressData.initialAccuracy +
        (progressData.improvementPercentage * 2) / 3,
    },
    { name: "Current", value: progressData.currentAccuracy },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Learning Progress</CardTitle>
          <div className="flex items-center text-emerald-500 text-sm font-medium">
            <TrendingUp className="h-4 w-4 mr-1" />+
            {progressData.improvementPercentage.toFixed(1)}%
          </div>
        </div>
        <CardDescription>
          Improvement in AI marking accuracy over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{stage.name}</span>
                <span className="text-sm text-muted-foreground">
                  {stage.value.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={stage.value}
                className={`h-2 ${index === stages.length - 1 ? "bg-primary" : "bg-blue-500"}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AILearningProgress;
