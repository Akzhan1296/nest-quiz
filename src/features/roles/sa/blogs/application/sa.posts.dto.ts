// create post
export type CreatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
export type ResultCreatePostDTO = {
  isBlogFound: boolean;
  isPostCreated: boolean;
  createdPostId: string | null;
};

// delete post
export type DeletePostDTO = {};
export type ResultDeletePostDTO = {};

// update post
export type UpdatePostDTO = {};
export type ResultUpdatePostDTO = {};
