export type HandlePostCommentDTO = {
  postId: string;
  userId: string;
  postLikeStatus: "Like" | "Dislike" | "None";
  userLogin: string;
};

export type HandlePostLikeResult = {
  isPostFound: boolean;
  isLikeStatusUpdated: boolean;
  isLikeStatusCreated: boolean;
};
