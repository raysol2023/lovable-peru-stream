export interface Content {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  manifest_url: string | null;
  trailer_url: string | null;
  category: string[] | null;
  is_tv: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentCarousel {
  title: string;
  category: string;
  content: Content[];
}
