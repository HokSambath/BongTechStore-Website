export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  colors: string[];
  image: string;
  specs: Record<string, string>;
  description: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  image: string;
  author: string;
  category: string;
  videoUrl?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
