export interface Post {
  title: string;
  content: string;
  id: string | null;
  imagePath: string | null | File;
  creator: string | null;
}
