export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
