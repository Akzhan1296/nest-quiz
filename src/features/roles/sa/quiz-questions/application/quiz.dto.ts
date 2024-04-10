export type ResultCreateQuizQuestionDTO = {
  isQuizQuestionCreated: boolean;
  createdQuizQuestionId: string | null;
};

export type CreateQuizQuestionDTO = {
  question: string;
  correctAnswers: string[];
};
