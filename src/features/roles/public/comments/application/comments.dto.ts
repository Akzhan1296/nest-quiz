export type CreateCommentDTO = {
  userLogin: string;
  userId: string;
  postId: string;
  content: string;
};

export type CreateCommentResult = {
  isPostFound: boolean;
  isCommentCreated: boolean;
  commentId: null | string;
};
