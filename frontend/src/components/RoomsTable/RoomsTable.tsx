import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Box, Stack, Typography, CircularProgress
} from "@mui/material";
// Импортируем иконки для оборудования
import {
  Groups2Outlined,
  Mic as MicIcon,
  Wifi as WifiIcon,
  Computer as ComputerIcon,
  DeveloperBoard as BoardIcon, // Для доски
  Videocam as VideoIcon,       // Для видеосвязи/проектора (или PresentToAll)
  PresentToAll as ProjectorIcon
} from "@mui/icons-material";
import { type Room } from "@/api/roomsApi";

const STATUS_LABEL: Record<string, string> = {
  available: "Доступна",
  reserved: "Забронирована",
  maintenance: "На обслуживании",
};

const STATUS_COLOR: Record<string, "success" | "warning" | "default"> = {
  available: "success",
  reserved: "warning",
  maintenance: "default",
};

// Конфигурация оборудования: Ключ -> { Название, Иконка }
const EQUIPMENT_MAP: Record<string, { label: string; icon: React.elementType }> = {
  projector: { label: "Проектор", icon: ProjectorIcon },
  microphone: { label: "Микрофон", icon: MicIcon },
  wifi: { label: "Wi-Fi", icon: WifiIcon },
  computers: { label: "Компьютеры", icon: ComputerIcon },
  whiteboard: { label: "Доска", icon: BoardIcon },
  video: { label: "Видеосвязь", icon: VideoIcon },
};

interface Props {
  rooms: Room[];
  loading: boolean;
  error?: string | null;
}

export function RoomsTable({ rooms, loading, error }: Props) {

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "grid", placeItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Не удалось загрузить данные: {error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef0f3" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8fafc" }}>
            <TableCell width={100}>Номер</TableCell>
            <TableCell>Название</TableCell>
            <TableCell width={140} align="right">Вместимость</TableCell>
            <TableCell>Оборудование</TableCell>
            <TableCell width={160}>Статус</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ p: 3 }}>Нет данных</TableCell>
            </TableRow>
          ) : (
            rooms.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>{r.code}</TableCell>
                <TableCell>
                  <Typography fontWeight={600} variant="body2">{r.name}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                    <Groups2Outlined fontSize="small" color="action" />
                    <span>{r.capacity}</span>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {r.equipment.map((code) => {
                      // Ищем конфигурацию для кода (wifi, projector...)
                      const config = EQUIPMENT_MAP[code];
                      const label = config ? config.label : code; // Если нет перевода, выводим код
                      const Icon = config ? config.icon : undefined;

                      return (
                        <Chip
                          key={code}
                          label={label}
                          // Если иконка есть, рендерим её внутри Chip
                          icon={Icon ? <Icon style={{ fontSize: 16 }} /> : undefined}
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      );
                    })}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABEL[r.status] ?? r.status}
                    size="small"
                    color={STATUS_COLOR[r.status] ?? "default"}
                    variant={r.status === "maintenance" ? "outlined" : "filled"}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
