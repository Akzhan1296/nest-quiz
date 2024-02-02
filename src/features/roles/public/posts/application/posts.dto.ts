export type HandlePostCommentDTO = {
  postId: string;
  userId: string;
  postLikeStatus: "Like" | "Dislike" | "None";
};

export type HandlePostLikeResult = {
  isPostFound: boolean;
  isLikeStatusUpdated: boolean;
  isLikeStatusCreated: boolean;
};
