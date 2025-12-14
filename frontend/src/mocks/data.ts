import type { RoomsResponseDto } from "@/api/roomsApi";

export const roomsPayload: RoomsResponseDto = {
  items: [
    {
      id: "1",
      code: "101",
      name: "Лекционная аудитория",
      capacity: 120,
      equipment: ["projector", "microphone", "wifi"],
      status: "available",
    },
    {
      id: "2",
      code: "102",
      name: "Компьютерный класс",
      capacity: 30,
      equipment: ["computers", "projector", "whiteboard", "wifi"],
      status: "reserved",
    },
    {
      id: "3",
      code: "201",
      name: "Конференц-зал",
      capacity: 50,
      equipment: ["projector", "microphone", "wifi", "video"],
      status: "available",
    },
    {
      id: "4",
      code: "202",
      name: "Семинарская",
      capacity: 25,
      equipment: ["whiteboard", "wifi"],
      status: "maintenance",
    },
  ],
  page: 1,
  total: 4,
};
