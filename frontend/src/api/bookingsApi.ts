import { http } from "./http";

export interface Booking {
  id: string;
  title: string;
  start: string;
  end: string;
  roomId: string;
  room?: {
    code: string;
    name: string;
  };
}

export interface CreateBookingDto {
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  roomId: string;
}

export interface StatisticsDto {
  totalRooms: number;
  activeBookings: number;
  availableRooms: number;
  totalEquipment: number;
}

export async function fetchStatistics(): Promise<StatisticsDto> {
  const { data } = await http.get<StatisticsDto>("/statistics");
  return data;
}

export async function fetchBookings(): Promise<Booking[]> {
  const { data } = await http.get<Booking[]>("/bookings");
  return data;
}

export async function createBooking(dto: CreateBookingDto): Promise<Booking> {
  const { data } = await http.post<Booking>("/bookings", dto);
  return data;
}

export async function deleteBooking(id: string): Promise<void> {
  await http.delete(`/bookings/${id}`);
}
