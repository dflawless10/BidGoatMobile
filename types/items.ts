export type AuctionItem = {
  timeLeft: React.ReactNode | undefined;
  id: number;
  item_id: number;
  name?: string;
  description?: string;
  auction_id: number;
  current_bid: number;
  end_time: string;
  auction_ends_at: string;
  rarity?: string;
  bidCount: number;
  price: number;
  photo_url?: string;
  image_url: string;
  tags?: string;
  isVisible?: boolean;
  DisplayItem?: string;
  listedAt?: string;
  title: string;
  image: string;
  isFavorite: boolean;
  mascot_name?: string;
  MASCOT_MOODS?: string;
  mascot?: {
    emoji: string;
    sound?: string;
  };
};
export type Rarity = 'common' | 'rare' | 'legendary';

export type ListedItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  photo_url: string;
  bid_count: number;
  listedAt: string;
  end_time?: string;
  auction_ends_at: string;
  timeLeft: string;
  rarity?: Rarity;
};



