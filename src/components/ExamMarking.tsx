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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Save, Check, X } from "lucide-react";
import AIAnalysisPanel from "./AIAnalysisPanel";

interface Question {
  id: string;
  number: number;
  text: string;
  maxScore: number;
}

interface StudentAnswer {
  id: string;
  questionId: string;
  text: string;
  aiSuggestedScore: number;
  examinerScore?: number;
  feedback?: string;
}

interface ExamMarkingProps {
  examId?: string;
  studentId?: string;
  questions?: Question[];
  studentAnswers?: StudentAnswer[];
  onSave?: (answers: StudentAnswer[]) => void;
  onComplete?: () => void;
}

const ExamMarking = ({
  examId = "1",
  studentId = "S12345",
  questions = [
    {
      id: "q1",
      number: 1,
      text: "Explain the concept of photosynthesis and its importance in ecosystems.",
      maxScore: 10,
    },
    {
      id: "q2",
      number: 2,
      text: "Describe the water cycle and how human activities impact it.",
      maxScore: 8,
    },
    {
      id: "q3",
      number: 3,
      text: "Compare and contrast mitosis and meiosis.",
      maxScore: 12,
    },
  ],
  studentAnswers = [
    {
      id: "a1",
      questionId: "q1",
      text: "Photosynthesis is the process by which plants convert light energy into chemical energy. Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. This process is crucial for ecosystems as it forms the base of most food chains and helps regulate atmospheric carbon dioxide levels.",
      aiSuggestedScore: 8,
    },
    {
      id: "a2",
      questionId: "q2",
      text: "The water cycle involves evaporation, condensation, precipitation, and collection. Human activities like deforestation, agriculture, and urbanization affect this cycle by changing runoff patterns and increasing water pollution.",
      aiSuggestedScore: 6,
    },
    {
      id: "a3",
      questionId: "q3",
      text: "Mitosis is cell division resulting in two identical daughter cells, while meiosis produces four genetically diverse haploid cells. Mitosis is for growth and repair, meiosis is for sexual reproduction.",
      aiSuggestedScore: 7,
    },
  ],
  onSave = () => {},
  onComplete = () => {},
}: ExamMarkingProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>(studentAnswers);
  const [activeTab, setActiveTab] = useState("question");

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer =
    answers.find((a) => a.questionId === currentQuestion.id) ||
    answers[currentQuestionIndex];

  const totalQuestions = questions.length;
  const markedQuestions = answers.filter(
    (a) => a.examinerScore !== undefined,
  ).length;
  const progressPercentage = (markedQuestions / totalQuestions) * 100;

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAcceptAIScore = () => {
    const updatedAnswers = answers.map((answer) => {
      if (answer.id === currentAnswer.id) {
        return { ...answer, examinerScore: answer.aiSuggestedScore };
      }
      return answer;
    });
    setAnswers(updatedAnswers);
    onSave(updatedAnswers);
  };

  const handleOverrideScore = (score: number, feedback: string) => {
    const updatedAnswers = answers.map((answer) => {
      if (answer.id === currentAnswer.id) {
        return { ...answer, examinerScore: score, feedback };
      }
      return answer;
    });
    setAnswers(updatedAnswers);
    onSave(updatedAnswers);
  };

  const handleSaveAndComplete = () => {
    onSave(answers);
    onComplete();
  };

  return (
    <div className="bg-background p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Exam Marking</h1>
            <p className="text-muted-foreground">
              Student ID: {studentId} | Exam ID: {examId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onSave(answers)}>
              <Save className="mr-2 h-4 w-4" /> Save Progress
            </Button>
            <Button onClick={handleSaveAndComplete}>
              <Check className="mr-2 h-4 w-4" /> Complete Marking
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Progress: {markedQuestions}/{totalQuestions} questions marked
            </span>
            <span className="text-sm">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Question {currentQuestion.number}</CardTitle>
                <CardDescription className="text-base">
                  {currentQuestion.text}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="question">
                      Question & Answer
                    </TabsTrigger>
                    <TabsTrigger value="marking">Marking Criteria</TabsTrigger>
                  </TabsList>
                  <TabsContent value="question">
                    <div className="bg-muted/50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Student Answer:</h3>
                      <p className="whitespace-pre-wrap">
                        {currentAnswer.text}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="marking">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Marking Criteria:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>
                            Accurate explanation of key concepts (4 points)
                          </li>
                          <li>Use of relevant examples (3 points)</li>
                          <li>Logical structure and coherence (2 points)</li>
                          <li>Correct use of terminology (1 point)</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">
                          Maximum Score: {currentQuestion.maxScore}
                        </h3>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <AIAnalysisPanel
              answer={currentAnswer}
              maxScore={currentQuestion.maxScore}
              onAccept={handleAcceptAIScore}
              onOverride={handleOverrideScore}
            />
          </div>
        </div>

        <div className="mt-6">
          <Separator className="my-6" />
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onSave(answers)}>
              <Save className="mr-2 h-4 w-4" /> Save Progress
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleSaveAndComplete}>
              <Check className="mr-2 h-4 w-4" /> Complete Marking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamMarking;
