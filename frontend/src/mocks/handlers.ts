import { http as mswHttp, HttpResponse } from "msw";
import { roomsPayload } from "./data";

export const handlers = [
  mswHttp.get('/api/rooms', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");

    console.log(`[MSW] Intercepted GET /rooms?page=${page}`);

    return HttpResponse.json({ ...roomsPayload, page });
  })
];
