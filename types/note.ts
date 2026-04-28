export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  shared: boolean;
  expiryDate: number | null;
  color: string;
  tags: string[];
}