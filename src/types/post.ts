export interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  is_pinned?: boolean;
}