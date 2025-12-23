
import { MenuItem, Table, Review } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // --- BREAKFAST: Steamed & Fried ---
  {
    id: 'b1',
    name: 'Steamed Idli (2 pcs)',
    description: 'Soft and fluffy steamed rice cakes, a cornerstone of South Indian breakfast, served with sambar and trio of chutneys.',
    price: 8.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tags: ['Healthy', 'Vegan'],
    spiceLevel: 0
  },
  {
    id: 'b2',
    name: 'Medu Vada (2 pcs)',
    description: 'Crispy, deep-fried savory lentil doughnuts seasoned with peppercorns, curry leaves, and green chillies.',
    price: 9.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=800&q=80',
    tags: ['Crispy', 'Vegetarian'],
    spiceLevel: 1
  },
  {
    id: 'b3',
    name: 'Sambar Idli',
    description: 'Two idlis submerged in a bowl of aromatic, spiced lentil sambar, topped with a dash of ghee and fresh coriander.',
    price: 10.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1601050633647-81a317577a36?auto=format&fit=crop&w=800&q=80',
    tags: ['Comfort Food', 'Vegetarian'],
    spiceLevel: 2
  },
  {
    id: 'b4',
    name: 'Idli Vada Combo',
    description: 'The ultimate pairing: one fluffy idli and one crispy medu vada served with sambar and chutneys.',
    price: 11.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    tags: ['Popular', 'Vegetarian'],
    spiceLevel: 1
  },
  {
    id: 'b5',
    name: 'Ghee Podi Idli',
    description: 'Mini idlis tossed in aromatic "Gunpowder" (spiced lentil powder) and a generous drizzle of clarified butter.',
    price: 10.49,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1630406184470-7fd4840f3018?auto=format&fit=crop&w=800&q=80',
    tags: ['Spicy', 'Ghee'],
    spiceLevel: 2
  },

  // --- BREAKFAST: Dosa Varieties ---
  {
    id: 'b6',
    name: 'Plain Dosa',
    description: 'A classic, thin and crispy golden crepe made from fermented rice and lentil batter.',
    price: 10.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    tags: ['Light', 'Vegan'],
    spiceLevel: 0
  },
  {
    id: 'b7',
    name: 'Masala Dosa',
    description: 'The world-famous crispy crepe stuffed with a savory, lightly spiced potato and onion mash.',
    price: 12.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    tags: ['Classic', 'Vegetarian'],
    spiceLevel: 1
  },
  {
    id: 'b8',
    name: 'Ghee Roast Dosa',
    description: 'A decadent version of the plain dosa, roasted with pure ghee for an extra crispy, buttery finish.',
    price: 12.49,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    tags: ['Crispy', 'Buttery'],
    spiceLevel: 0
  },
  {
    id: 'b9',
    name: 'Paper Thin Dosa',
    description: 'An oversized, exceptionally thin and wafer-crisp dosa that melts in your mouth.',
    price: 13.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Special'],
    spiceLevel: 0
  },
  {
    id: 'b10',
    name: 'Rava Dosa',
    description: 'A unique, lacy crepe made with semolina (rava), rice flour, and spices. No fermentation required.',
    price: 12.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1630343710506-89f8b9f21d31?auto=format&fit=crop&w=800&q=80',
    tags: ['Lacy', 'Vegetarian'],
    spiceLevel: 1
  },
  {
    id: 'b11',
    name: 'Onion Rava Dosa',
    description: 'Rava Dosa enhanced with a generous topping of crunchy finely chopped onions and green chillies.',
    price: 13.49,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=800&q=80',
    tags: ['Savory', 'Vegetarian'],
    spiceLevel: 2
  },
  {
    id: 'b12',
    name: 'Set Dosa',
    description: 'A trio of small, soft, and spongy dosas, served with vegetable sagu or coconut chutney.',
    price: 11.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1601050633647-81a317577a36?auto=format&fit=crop&w=800&q=80',
    tags: ['Soft', 'Vegetarian'],
    spiceLevel: 0
  },
  {
    id: 'b13',
    name: 'Mysore Masala Dosa',
    description: 'Spicy! Crepe lined with a fiery red garlic-chilli chutney before being filled with potato masala.',
    price: 14.49,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1630406184470-7fd4840f3018?auto=format&fit=crop&w=800&q=80',
    tags: ['Spicy', 'Favorite'],
    spiceLevel: 3
  },
  {
    id: 'b14',
    name: 'Cheese Chilli Dosa',
    description: 'A UAE favorite! Our classic dosa filled with melted cheddar cheese and mild green chillies.',
    price: 15.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    tags: ['Cheese', 'Fusion'],
    spiceLevel: 1
  },

  // --- BREAKFAST: Rice & Semolina ---
  {
    id: 'b15',
    name: 'Ghee Pongal',
    description: 'Savory rice and lentil porridge seasoned with black pepper, cumin, ginger, and crunchy cashews.',
    price: 11.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['Protein Rich', 'Comfort'],
    spiceLevel: 1
  },
  {
    id: 'b16',
    name: 'Vegetable Upma',
    description: 'A thick semolina porridge cooked with seasonal vegetables, curry leaves, and mustard seeds.',
    price: 9.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tags: ['Fiber Rich', 'Light'],
    spiceLevel: 1
  },
  {
    id: 'b17',
    name: 'Lemon Rice',
    description: 'Zesty and bright rice flavored with lemon juice, turmeric, and a tempered crunch of peanuts and lentils.',
    price: 10.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    tags: ['Zesty', 'Vegan'],
    spiceLevel: 1
  },

  // --- BREAKFAST: Uttapam ---
  {
    id: 'b18',
    name: 'Plain Uttapam',
    description: 'Thick, pancake-like South Indian crepe made from the same rice and lentil batter.',
    price: 11.49,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    tags: ['Spongy', 'Vegan'],
    spiceLevel: 0
  },
  {
    id: 'b19',
    name: 'Onion Uttapam',
    description: 'Our fluffy uttapam topped with a generous layer of caramelized and fresh onions.',
    price: 12.49,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    tags: ['Classic', 'Vegetarian'],
    spiceLevel: 1
  },
  {
    id: 'b20',
    name: 'Vegetable Uttapam',
    description: 'A colorful and healthy breakfast option topped with tomatoes, onions, carrots, and peas.',
    price: 12.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1630406184470-7fd4840f3018?auto=format&fit=crop&w=800&q=80',
    tags: ['Healthy', 'Vibrant'],
    spiceLevel: 1
  },
  {
    id: 'b21',
    name: 'Tomato & Coriander Uttapam',
    description: 'Tangy tomatoes and fresh coriander leaves embedded in a golden uttapam base.',
    price: 12.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tags: ['Tangy', 'Fresh'],
    spiceLevel: 1
  },

  // --- BREAKFAST: Kerala Specials ---
  {
    id: 'b22',
    name: 'Appam with Vegetable Stew',
    description: 'Two lacy-edged, soft-centered rice hoppers served with a mild, creamy coconut milk stew.',
    price: 14.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1601050633647-81a317577a36?auto=format&fit=crop&w=800&q=80',
    tags: ['Kerala Classic', 'Coconut'],
    spiceLevel: 0
  },
  {
    id: 'b23',
    name: 'Appam with Kadala Curry',
    description: 'Three lacy-edged, soft-centered rice hoppers served with a rich Malabar-style black chickpea curry on a fresh banana leaf.',
    price: 13.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1630343710506-89f8b9f21d31?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['Chef Special', 'Most Popular', 'Authentic'],
    spiceLevel: 2
  },
  {
    id: 'b24',
    name: 'Kerala Puttu with Banana',
    description: 'Steamed cylinders of ground rice and coconut, served with sweet local bananas and sugar. A true Kerala masterpiece.',
    price: 11.99,
    cuisine: 'South Indian',
    meal: ['Breakfast'],
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e5db?auto=format&fit=crop&w=800&q=80',
    tags: ['Traditional', 'Authentic Kerala'],
    spiceLevel: 0
  },

  // --- LUNCH & DINNER: North Indian ---
  {
    id: 'l1',
    name: 'Butter Chicken Heritage',
    description: 'Charcoal-grilled chicken chunks simmered in a silky tomato and cashew nut gravy.',
    price: 18.99,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Special', 'Classic'],
    spiceLevel: 1
  },
  {
    id: 'l2',
    name: 'Dal Makhani Signature',
    description: 'Black lentils slow-cooked for 24 hours with cream, butter, and traditional spices.',
    price: 15.99,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tags: ['Vegetarian', 'Slow Cooked'],
    spiceLevel: 0
  },
  {
    id: 'n1',
    name: 'Paneer Tikka Masala',
    description: 'Clay-oven roasted paneer in a rich, chunky onion-tomato gravy.',
    price: 16.99,
    cuisine: 'North Indian',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    tags: ['Vegetarian', 'Tandoori'],
    spiceLevel: 2
  },

  // --- LUNCH & DINNER: Chinese ---
  {
    id: 'c1',
    name: 'Chilli Paneer Dry',
    description: 'Cottage cheese cubes tossed with bell peppers, onions, and spicy Sichuan sauce.',
    price: 14.99,
    cuisine: 'Chinese',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    tags: ['Spicy', 'Fusion'],
    spiceLevel: 3
  },
  {
    id: 'c2',
    name: 'Hakka Noodles',
    description: 'Stir-fried noodles with crisp julienned vegetables and a touch of dark soy sauce.',
    price: 13.99,
    cuisine: 'Chinese',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    tags: ['Vegetarian', 'Wok Tossed'],
    spiceLevel: 1
  },
  {
    id: 'f1',
    name: 'Chicken Manchurian',
    description: 'Classic Indo-Chinese fried chicken balls in a ginger-garlic-soya gravy.',
    price: 17.49,
    cuisine: 'Chinese',
    meal: ['Lunch', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    tags: ['Most Popular'],
    spiceLevel: 2
  }
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  seats: i % 3 === 0 ? 4 : (i % 2 === 0 ? 2 : 6),
  status: Math.random() > 0.8 ? 'occupied' : 'available',
  position: { x: (i % 5) * 100, y: Math.floor(i / 5) * 100 }
}));

export const REVIEWS: Review[] = [
  // Butter Chicken (l1)
  { id: 'r1', dishId: 'l1', user: 'Sarah Jenkins', rating: 5, comment: 'The Butter Chicken is the best I have ever had. Truly authentic!', date: '2023-10-15' },
  { id: 'r3', dishId: 'l1', user: 'Mark Thompson', rating: 5, comment: 'Incredible depth of flavor.', date: '2023-11-02' },
  { id: 'r4', dishId: 'l1', user: 'Elena Rossi', rating: 4, comment: 'Very creamy, maybe a bit too much for some, but I loved it.', date: '2023-11-10' },
  
  // Dosa (b7)
  { id: 'r5', dishId: 'b7', user: 'Amit Sharma', rating: 5, comment: 'Perfect crispy texture. Reminds me of home.', date: '2023-09-20' },
  { id: 'r6', dishId: 'b7', user: 'Claire Dubois', rating: 4, comment: 'Great breakfast option in DIFC.', date: '2023-10-05' },
  
  // Chilli Paneer (c1)
  { id: 'r2', dishId: 'c1', user: 'Raj Patel', rating: 4, comment: 'Great fusion food. The Chilli Paneer had the perfect kick.', date: '2023-10-12' },
  { id: 'r7', dishId: 'c1', user: 'Sanjay Gupta', rating: 5, comment: 'Best Indo-Chinese in Dubai hands down.', date: '2023-11-15' },
  
  // Dal Makhani (l2)
  { id: 'r8', dishId: 'l2', user: 'Priya Mani', rating: 5, comment: 'The 24-hour slow cook really shows in the texture.', date: '2023-11-18' },
  
  // Cheese Dosa (b14)
  { id: 'r13', dishId: 'b14', user: 'Omar Al-Hashimi', rating: 5, comment: 'Finally, a perfect cheese dosa in Dubai! The kids loved it.', date: '2024-01-05' },

  // Mysore Masala Dosa (b13)
  { id: 'r14', dishId: 'b13', user: 'Deepa V.', rating: 5, comment: 'The red chutney is so authentic. Just like in Mysore.', date: '2024-01-12' },

  // Appam with Stew (b22)
  { id: 'r15', dishId: 'b22', user: 'James Wilson', rating: 5, comment: 'Such a delicate and light breakfast. The coconut milk stew is divine.', date: '2023-12-28' },

  // Puttu (b24)
  { id: 'r16', dishId: 'b24', user: 'Meera K.', rating: 4, comment: 'Fresh and warm puttu. Perfect start to the day.', date: '2024-01-20' },
  { id: 'r17', dishId: 'b24', user: 'Faisal J.', rating: 5, comment: 'As authentic as it gets outside of Kerala. 10/10.', date: '2024-02-14' }
];
