export interface CreateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface ResultCreateBlogDTO {
  createdBlogId: string | null;
  isBlogCreated: boolean;
}

export interface UpdateBlogDTO {}

export interface DeleteBlogDTO {}
