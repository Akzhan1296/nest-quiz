export type ResultCreateQuizQuestionDTO = {
  isQuizQuestionCreated: boolean;
  createdQuizQuestionId: string | null;
};

export type DeleteQuestionResultDTO = {
  isQuestionDeleted: boolean;
  isQuestionFound: boolean;
};

export type CreateQuizQuestionDTO = {
  body: string;
  correctAnswers: string[];
};

export type DeleteQuizQuestionDTO = { questionId: string };
