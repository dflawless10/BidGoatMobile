// types/items.d.ts
export interface Item {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string[];
  // Add other item properties as needed
}