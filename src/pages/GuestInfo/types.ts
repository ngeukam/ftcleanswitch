export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
}

export interface Apartment {
  id: string;
  number: number;
  name: string;
  property_assigned_name: string;
  property_address: string;
  cleaned: boolean;
  apartmentType: string;
  capacity: number;
  currency:string;
}

export interface Booking {
  id: string;
  apartment: Apartment;
  startDate: string;
  endDate: string;
  status: string;
  duration?: number;
  totalPrice?: number;
}

export interface Guest {
  id: string;
  user: User;
  current_apartment:string;
  booking_count?: number;
  id_card_url?: string;
  booking_stats?: {
    total_bookings: number;
    total_days_stayed: number;
    last_booking_duration: number;
  };
  recent_bookings?: Booking[];
}

export interface GuestCreateUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_card?: any;
  password?: string;
}