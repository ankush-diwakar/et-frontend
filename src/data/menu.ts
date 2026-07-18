export type Category = "Paneer Bowls" | "Sprout Bowls" | "Beverages" | string;

export interface Bowl {
  id: string;
  name: string;
  dressing: string;
  category: Category;
  protein: string;
  calories: string;
  carbs: string;
  fat?: string;
  fiber?: string;
  ingredients: string[];
  price: number | null;
  jain: boolean;
  image?: string;
  comingSoon?: boolean;
  notAvailable?: boolean;
}
