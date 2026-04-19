export interface Product {
  id: string;
  name: string;
  category: 'Device' | 'Gaming PC' | 'Accessories' | 'Smartphone' | 'Product';
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
  date: string;
  image: string;
  author: string;
  category: string;
  videoUrl?: string;
}
