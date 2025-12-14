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

export async function fetchRooms(page = 1): Promise<RoomsResponseDto> {
  const { data } = await http.get<RoomsResponseDto>("/rooms", {
    params: { page },
  });
  return data;
}
