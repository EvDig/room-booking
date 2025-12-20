import { http } from "./http";

export type RoomStatus = "available" | "reserved" | "maintenance";

export interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
  note?: string;
}

export interface RoomsResponseDto {
  items: Room[];
  page: number;
  total: number;
}

export interface RoomFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

export async function fetchRooms(params: RoomFilters = {}): Promise<RoomsResponseDto> {
  // params: { page: 1, q: '101', status: 'available' }
  const { data } = await http.get<RoomsResponseDto>("/rooms", { params });
  return data;
}
