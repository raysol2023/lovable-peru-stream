export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  scope: 'VOD' | 'VOD_TV';
  simultaneous_limit: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'pending';
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}
