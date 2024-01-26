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

export type HandleLikeCommentDTO = {
  commentId: string;
  commentLikeStatus: "Like" | "Dislike" | "None";
  userId: string;
};

export type HandleCommentLikeResult = {
  isCommentFound: boolean;
  isLikeStatusUpdated: boolean;
};
