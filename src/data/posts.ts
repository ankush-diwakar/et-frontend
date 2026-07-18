import ingredients from "@/assets/blog-ingredients.jpg";
import protein from "@/assets/blog-protein.jpg";
import kitchen from "@/assets/blog-kitchen.jpg";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  cover: string;
  body: string[];
}

export const POSTS: Post[] = [
  {
    slug: "why-22-30g-protein-matters",
    title: "Why 22–30g of protein per meal actually matters",
    excerpt: "Most Indian meals quietly under-deliver on protein. Here's why every Etato bowl is engineered around a 22–30g target — and what it does for your body.",
    date: "April 18, 2026",
    readTime: "5 min read",
    category: "Nutrition",
    cover: protein,
    body: [
      "Walk into any Indian kitchen and you'll find dal, sabzi, roti and rice. Comforting? Yes. Protein-dense? Often not. A typical home-cooked vegetarian thali delivers 8–12g of protein per meal — well below the 25–30g range nutritionists now recommend per sitting for muscle synthesis and satiety.",
      "Etato bowls are engineered around a 22–30g protein target using paneer, sprouts, soya chunks, chickpeas, seeds and whole-grain pasta. The math isn't accidental — it's built so one bowl carries you for 4–5 hours without crashing.",
      "What does this look like in practice? Better appetite control, fewer afternoon snack runs, slow steady energy through the day, and meaningful muscle recovery if you train. Protein isn't just for gym-goers — it's the most underrated lever for healthy weight management.",
      "Pro tip: pair your bowl with 500ml water and 10 minutes of walking after eating. You'll feel the difference within the first week.",
    ],
  },
  {
    slug: "fresh-daily-what-it-really-means",
    title: "\"Fresh daily\" — what it really means in our kitchen",
    excerpt: "We use the words \"fresh\" and \"daily\" a lot. Here's the actual workflow behind your Etato bowl, from the morning mandi to your doorstep.",
    date: "April 10, 2026",
    readTime: "4 min read",
    category: "Behind the Scenes",
    cover: kitchen,
    body: [
      "5:30 AM. Our team is at the local mandi in Katraj picking vegetables. Nothing pre-packed, nothing frozen. We hand-pick broccoli florets, baby corn, bell peppers, lettuce, sprouts, paneer and herbs — only what we'll prep that day.",
      "By 8:00 AM, everything is back in our FSSAI-registered cloud kitchen. Vegetables get a triple wash — water, salt rinse, and a final clean rinse. Paneer is portioned. Sprouts are checked. Dressings are made fresh in small batches.",
      "Prep doesn't happen the night before. Lunch bowls are assembled between 10:30–11:30 AM. Dinner bowls between 5:30–6:30 PM. From the moment a bowl is built to the moment it reaches your door is under 90 minutes — that's what \"fresh\" actually looks like.",
      "It's a slower way to run a kitchen. It costs more. But it's the only way we know to keep our promise: ingredients you can trust, nutrition you can see.",
    ],
  },
  {
    slug: "guide-to-jain-friendly-salads",
    title: "A practical guide to Jain-friendly salad bowls",
    excerpt: "Jain dietary rules don't have to mean boring. Here's how we substitute — not just remove — to keep flavour and nutrition intact.",
    date: "April 2, 2026",
    readTime: "3 min read",
    category: "Diet & Lifestyle",
    cover: ingredients,
    body: [
      "Jain dietary preferences exclude onion, garlic and root vegetables (potato, carrot, beetroot, ginger). The easy approach is to just remove those ingredients — but that leaves a flat, less nutritious bowl.",
      "Our approach is to substitute. No carrot? We boost cabbage, capsicum and zucchini. No onion-garlic in the dressing? We build flavour with mint, coriander, fresh lime, sesame and a pinch of black pepper.",
      "The result: every Jain version of an Etato bowl carries the same protein and calorie range as the regular bowl. You don't lose nutrition. You just lose the things you choose to.",
      "Just mention \"Jain\" when you order on WhatsApp or select it on the subscription form — we handle the rest.",
    ],
  },
];
