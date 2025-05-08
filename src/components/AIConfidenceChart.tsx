import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AIConfidenceChartProps {
  confidenceData?: {
    high: number;
    medium: number;
    low: number;
  };
  title?: string;
  description?: string;
}

const AIConfidenceChart = ({
  confidenceData = {
    high: 65,
    medium: 25,
    low: 10,
  },
  title = "AI Confidence Distribution",
  description = "Breakdown of AI confidence levels across all marked papers",
}: AIConfidenceChartProps) => {
  const confidenceLevels = [
    {
      name: "High (90-100%)",
      value: confidenceData.high,
      color: "bg-emerald-500",
    },
    {
      name: "Medium (70-89%)",
      value: confidenceData.medium,
      color: "bg-amber-500",
    },
    { name: "Low (<70%)", value: confidenceData.low, color: "bg-red-500" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {confidenceLevels.map((level, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{level.name}</span>
                <span className="text-sm text-muted-foreground">
                  {level.value}%
                </span>
              </div>
              <Progress value={level.value} className={`h-2 ${level.color}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfidenceChart;
