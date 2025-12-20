import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, MenuItem
} from '@mui/material';
import { type CreateBookingDto } from '@/api/bookingsApi';
import { fetchRooms, type Room } from '@/api/roomsApi';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingDto) => Promise<void>;
}

export const CreateBookingModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');

  // Даты по умолчанию: сегодня, следующий час
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRooms(1).then(data => setRooms(data.items));
      // Сброс формы
      setTitle('');
      setRoomId('');
      setError(null);
      // Установим текущее время округленное до часа
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1);

      // Формат для input type="datetime-local" (YYYY-MM-DDTHH:mm)
      const toLocalISO = (d: Date) => d.toISOString().slice(0, 16);

      setStart(toLocalISO(now));
      setEnd(toLocalISO(nextHour));
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);
    if (!title || !roomId || !start || !end) {
      setError("Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      // Преобразуем локальное время в ISO строку с часовым поясом (для бэка)
      const startDate = new Date(start).toISOString();
      const endDate = new Date(end).toISOString();

      await onSubmit({
        title,
        roomId,
        start: startDate,
        end: endDate
      });
      onClose();
    } catch (e: any) {
      // Если пришла ошибка 409 (Conflict), покажем красиво
      const serverMsg = e.response?.data?.detail || "Ошибка при создании";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Новое бронирование</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          autoFocus
          margin="dense"
          label="Название мероприятия"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          select
          margin="dense"
          label="Аудитория"
          fullWidth
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          {rooms.map((room) => (
            <MenuItem key={room.id} value={room.id}>
              {room.code} - {room.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          margin="dense"
          label="Начало"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <TextField
          margin="dense"
          label="Конец"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
