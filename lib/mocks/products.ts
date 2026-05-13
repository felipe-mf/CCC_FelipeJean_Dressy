import type { Product } from "@/types";

export interface MockProduct extends Product {
  image_url: string;
  store_name: string;
  store_slug: string;
}

const now = new Date().toISOString();

export const mockProducts: MockProduct[] = [
  {
    id: "prd_01",
    store_id: "str_alfaiataria",
    store_name: "Alfaiataria Lume",
    store_slug: "alfaiataria-lume",
    name: "Blazer cropped em linho",
    description:
      "Blazer estruturado em linho natural com forro de algodão. Caimento solto, ombros marcados.",
    price: 289.0,
    condition: "like_new",
    size: "M",
    brand: "Lume",
    is_active: true,
    stock: 1,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
  },
  {
    id: "prd_02",
    store_id: "str_garimpo",
    store_name: "Garimpo do Centro",
    store_slug: "garimpo-do-centro",
    name: "Camisa oversized vintage",
    description: "Camisa de algodão pesado, costura francesa, anos 90.",
    price: 124.9,
    condition: "good",
    size: "G",
    brand: null,
    is_active: true,
    stock: 1,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
  },
  {
    id: "prd_03",
    store_id: "str_alfaiataria",
    store_name: "Alfaiataria Lume",
    store_slug: "alfaiataria-lume",
    name: "Calça pantalona alfaiataria",
    description: "Pantalona em lã fria com pregas frontais e bolso italiano.",
    price: 219.0,
    condition: "like_new",
    size: "38",
    brand: "Lume",
    is_active: true,
    stock: 2,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
  },
  {
    id: "prd_04",
    store_id: "str_ateliepaula",
    store_name: "Ateliê Paula",
    store_slug: "atelie-paula",
    name: "Vestido midi com babado",
    description: "Vestido midi em viscose, manga curta, babado na barra.",
    price: 178.0,
    condition: "new",
    size: "P",
    brand: "Paula",
    is_active: true,
    stock: 3,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
  },
  {
    id: "prd_05",
    store_id: "str_garimpo",
    store_name: "Garimpo do Centro",
    store_slug: "garimpo-do-centro",
    name: "Jaqueta jeans desbotada",
    description: "Jaqueta jeans com lavagem natural e detalhes desfiados.",
    price: 159.0,
    condition: "good",
    size: "M",
    brand: "Levi's",
    is_active: true,
    stock: 1,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80",
  },
  {
    id: "prd_06",
    store_id: "str_ateliepaula",
    store_name: "Ateliê Paula",
    store_slug: "atelie-paula",
    name: "Tricot off-white gola alta",
    description: "Tricot de algodão pima com gola alta e mangas bufantes.",
    price: 142.5,
    condition: "like_new",
    size: "M",
    brand: null,
    is_active: true,
    stock: 2,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
  },
  {
    id: "prd_07",
    store_id: "str_brechofiore",
    store_name: "Brechó Fiore",
    store_slug: "brecho-fiore",
    name: "Saia plissada midi",
    description: "Saia plissada em tecido encorpado, cintura alta.",
    price: 98.0,
    condition: "fair",
    size: "40",
    brand: null,
    is_active: true,
    stock: 1,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=80",
  },
  {
    id: "prd_08",
    store_id: "str_brechofiore",
    store_name: "Brechó Fiore",
    store_slug: "brecho-fiore",
    name: "Bota coturno couro castanho",
    description: "Coturno em couro legítimo castanho, solado tratorado.",
    price: 245.0,
    condition: "good",
    size: "37",
    brand: "Cravo & Canela",
    is_active: true,
    stock: 1,
    created_at: now,
    updated_at: now,
    image_url:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
  },
];

export function getMockProductById(id: string): MockProduct | undefined {
  return mockProducts.find((p) => p.id === id);
}

export const conditionLabels: Record<Product["condition"], string> = {
  new: "Novo",
  like_new: "Seminovo",
  good: "Bom estado",
  fair: "Usado",
};
