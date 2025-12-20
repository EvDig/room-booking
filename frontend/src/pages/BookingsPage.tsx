import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Chip
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import { fetchBookings, createBooking, deleteBooking, type Booking, type CreateBookingDto } from '@/api/bookingsApi';
import { CreateBookingModal } from '@/components/CreateBookingModal';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Функция загрузки данных
  const loadData = () => {
    fetchBookings()
      .then(setBookings)
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (dto: CreateBookingDto) => {
    await createBooking(dto);
    loadData(); // Обновляем список после создания
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить бронирование?')) {
      await deleteBooking(id);
      loadData();
    }
  };

  // Форматирование даты
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Управление бронированием
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Создать бронь
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #eef0f3', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell>Событие</TableCell>
              <TableCell>Аудитория</TableCell>
              <TableCell>Время начала</TableCell>
              <TableCell>Время конца</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Нет активных бронирований
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell fontWeight={500}>{b.title}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<EventIcon fontSize="small" />}
                      label={b.room ? `${b.room.code} ${b.room.name}` : 'Unknown Room'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(b.start)}</TableCell>
                  <TableCell>{formatDate(b.end)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleDelete(b.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <CreateBookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </Container>
  );
};

export default BookingsPage;
