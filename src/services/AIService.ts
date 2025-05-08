import axios from "axios";

export interface AIMarkingRequest {
  questionText: string;
  studentResponse: string;
  markingCriteria: string[];
  maxScore: number;
}

export interface AIMarkingResponse {
  suggestedScore: number;
  confidenceLevel: number;
  reasoning: string;
  criteriaMatched: string[];
}

interface AIFeedbackRequest {
  questionId: string;
  studentResponse: string;
  aiSuggestedScore: number;
  examinerScore: number;
  feedback: string;
}

interface AILearningProgressResponse {
  initialAccuracy: number;
  currentAccuracy: number;
  improvementPercentage: number;
  confidenceLevels: {
    high: number;
    medium: number;
    low: number;
  };
}

class AIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    // In a real implementation, these would come from environment variables
    this.apiUrl = "https://api.aimarking.example.com/v1";
    this.apiKey = "dummy-api-key";
  }

  /**
   * Get AI suggested score for a student answer
   */
  async getAISuggestedScore(
    request: AIMarkingRequest,
  ): Promise<AIMarkingResponse> {
    try {
      // In a real implementation, this would make an actual API call
      // For now, we'll simulate the AI response

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simple scoring algorithm based on keyword matching
      const response = this.simulateAIScoring(request);

      return response;
    } catch (error) {
      console.error("Error getting AI suggested score:", error);
      throw new Error("Failed to get AI suggested score");
    }
  }

  /**
   * Submit examiner feedback to improve the AI model
   */
  async submitExaminerFeedback(request: AIFeedbackRequest): Promise<void> {
    try {
      // In a real implementation, this would make an actual API call to submit feedback
      // For now, we'll just log the feedback
      console.log("Examiner feedback submitted:", request);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // In a real implementation, this would return a success response from the API
      return;
    } catch (error) {
      console.error("Error submitting examiner feedback:", error);
      throw new Error("Failed to submit examiner feedback");
    }
  }

  /**
   * Get AI learning progress
   */
  async getLearningProgress(): Promise<AILearningProgressResponse> {
    try {
      // In a real implementation, this would make an actual API call
      // For now, we'll simulate the response

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Return simulated learning progress
      return {
        initialAccuracy: 85,
        currentAccuracy: 94.2,
        improvementPercentage: 10.8,
        confidenceLevels: {
          high: 65,
          medium: 25,
          low: 10,
        },
      };
    } catch (error) {
      console.error("Error getting AI learning progress:", error);
      throw new Error("Failed to get AI learning progress");
    }
  }

  /**
   * Simulate AI scoring based on keyword matching
   * This is a placeholder for actual AI scoring logic
   */
  private simulateAIScoring(request: AIMarkingRequest): AIMarkingResponse {
    const { questionText, studentResponse, markingCriteria, maxScore } =
      request;

    // Convert to lowercase for case-insensitive matching
    const response = studentResponse.toLowerCase();

    // Check how many criteria are matched in the response
    const matchedCriteria: string[] = [];

    markingCriteria.forEach((criterion) => {
      // Simple keyword matching (in a real AI system, this would be much more sophisticated)
      const keywords = criterion.toLowerCase().split(" ");
      const keywordMatches = keywords.filter(
        (keyword) => keyword.length > 3 && response.includes(keyword),
      );

      if (keywordMatches.length > 0) {
        matchedCriteria.push(criterion);
      }
    });

    // Calculate score based on matched criteria
    const matchRatio = matchedCriteria.length / markingCriteria.length;
    const suggestedScore = Math.round(matchRatio * maxScore);

    // Calculate confidence level (70-95%)
    // In a real system, this would be based on model certainty
    const confidenceLevel = 70 + Math.floor(Math.random() * 25);

    // Generate reasoning
    let reasoning = `The response addresses ${matchedCriteria.length} out of ${markingCriteria.length} marking criteria. `;

    if (matchedCriteria.length > 0) {
      reasoning += `The student correctly covers: ${matchedCriteria.join(", ")}. `;
    }

    if (matchedCriteria.length < markingCriteria.length) {
      const missingCriteria = markingCriteria.filter(
        (c) => !matchedCriteria.includes(c),
      );
      reasoning += `The response is missing or inadequately addresses: ${missingCriteria.join(", ")}.`;
    }

    return {
      suggestedScore,
      confidenceLevel,
      reasoning,
      criteriaMatched: matchedCriteria,
    };
  }
}

export const aiService = new AIService();
export default aiService;
