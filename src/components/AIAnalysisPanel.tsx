import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Edit,
} from "lucide-react";

interface AIAnalysisPanelProps {
  studentResponse?: string;
  questionText?: string;
  markingCriteria?: string[];
  suggestedScore?: number;
  maxScore?: number;
  confidenceLevel?: number;
  aiReasoning?: string;
  onAcceptScore?: () => void;
  onOverrideScore?: (score: number, feedback: string) => void;
}

const AIAnalysisPanel = ({
  studentResponse = "The mitochondria is the powerhouse of the cell. It produces energy through cellular respiration, converting glucose into ATP through a series of chemical reactions.",
  questionText = "Explain the function of mitochondria in a cell (5 marks)",
  markingCriteria = [
    "Identifies mitochondria as energy producers",
    "Mentions cellular respiration",
    "Explains ATP production",
    "Describes the process accurately",
    "Uses correct scientific terminology",
  ],
  suggestedScore = 4,
  maxScore = 5,
  confidenceLevel = 85,
  aiReasoning = "The student correctly identifies the mitochondria's primary function as energy production and mentions cellular respiration and ATP. The explanation of the process is mostly accurate but lacks some detail about the specific stages of cellular respiration (glycolysis, Krebs cycle, electron transport chain).",
  onAcceptScore = () => {},
  onOverrideScore = () => {},
}: AIAnalysisPanelProps) => {
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideScore, setOverrideScore] = useState(suggestedScore);
  const [feedback, setFeedback] = useState("");

  const getConfidenceBadgeVariant = () => {
    if (confidenceLevel >= 80) return "default";
    if (confidenceLevel >= 60) return "secondary";
    return "outline";
  };

  const handleAccept = () => {
    onAcceptScore();
  };

  const handleOverride = () => {
    onOverrideScore(overrideScore, feedback);
    setOverrideMode(false);
  };

  return (
    <Card className="w-full max-w-md bg-white border-2 border-gray-100 shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>AI Analysis</span>
          <Badge variant={getConfidenceBadgeVariant()}>
            {confidenceLevel}% Confidence
          </Badge>
        </CardTitle>
        <CardDescription>{questionText}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Student Response:</h3>
          <p className="text-sm text-gray-700">{studentResponse}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Marking Criteria:</h3>
          <ul className="space-y-1">
            {markingCriteria.map((criterion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">
                  {index < suggestedScore ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-300" />
                  )}
                </span>
                {criterion}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">AI Suggested Score:</h3>
            <span className="text-lg font-bold">
              {suggestedScore}/{maxScore}
            </span>
          </div>
          <Progress value={(suggestedScore / maxScore) * 100} className="h-2" />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-1">AI Reasoning:</h3>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
            {aiReasoning}
          </p>
        </div>

        {overrideMode ? (
          <div className="space-y-3 border-t pt-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">
                  Override Score: {overrideScore}/{maxScore}
                </h3>
              </div>
              <Slider
                value={[overrideScore]}
                min={0}
                max={maxScore}
                step={1}
                onValueChange={(value) => setOverrideScore(value[0])}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">
                Feedback for AI Improvement:
              </h3>
              <Textarea
                placeholder="Explain why you're changing the score to help the AI learn..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-24"
              />
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {!overrideMode ? (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setOverrideMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Override
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Override AI score and provide feedback</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleAccept}>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Accept Score
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accept the AI suggested score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setOverrideMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleOverride}>Submit Override</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIAnalysisPanel;
