import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Grid } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BuildIcon from '@mui/icons-material/Build';

import SummaryCard from '../components/SummaryCard';
import { RoomsTable } from '@/components/RoomsTable';
import FiltersAndSearch from '../components/FiltersAndSearch';

import { fetchStatistics, type StatisticsDto } from '@/api/bookingsApi';
import { fetchRooms, type Room } from '@/api/roomsApi';

const RoomCatalogPage: React.FC = () => {
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  // --- Состояния интерфейса ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Состояния фильтров ---
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // 1. Загрузка статистики (один раз при старте)
  useEffect(() => {
    fetchStatistics().then(setStats).catch(console.error);
  }, []);

  // 2. Загрузка комнат (при изменении фильтров)
  useEffect(() => {
    // Делаем дебаунс (задержку) для поиска, чтобы не долбить сервер при каждом нажатии
    const timer = setTimeout(() => {
      loadRooms();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status]);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      // Передаем параметры фильтрации в API
      const data = await fetchRooms({
        page: 1,
        limit: 100, // Пока берем много, без пагинации на UI
        q: search,
        status
      });
      setRooms(data.items);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
  };

  // Данные для карточек
  const summaryData = [
    {
      title: 'Всего аудиторий',
      value: stats?.totalRooms ?? 0,
      icon: <MeetingRoomIcon />,
      iconColor: '#E3F2FD',
      tagLabel: 'Всего',
      tagColor: 'success' as const,
      tagVariant: 'outlined' as const
    },
    {
      title: 'Доступные сейчас',
      value: stats?.availableRooms ?? 0,
      icon: <CheckCircleIcon />,
      iconColor: '#E8F5E9',
      tagLabel: 'Свободно',
      tagColor: 'success' as const,
      tagVariant: 'filled' as const
    },
    {
      title: 'Забронированы',
      value: stats?.activeBookings ?? 0,
      icon: <CalendarMonthIcon />,
      iconColor: '#FFF3E0',
      tagLabel: 'Занято',
      tagColor: 'warning' as const,
      tagVariant: 'filled' as const
    },
    {
      title: 'Единиц оборудования',
      value: stats?.totalEquipment ?? 0,
      icon: <BuildIcon />,
      iconColor: '#F3E5F5',
      tagLabel: 'Всего',
      tagColor: 'default' as const,
      tagVariant: 'filled' as const
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Каталог аудиторий
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Управляйте информацией об аудиториях, их оборудовании и местоположением
        </Typography>
      </Box>

      {/* Карточки (не зависят от фильтров таблицы) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SummaryCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Фильтры */}
      <FiltersAndSearch
        searchRequest={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onReset={handleReset}
      />

      {/* Таблица */}
      <Box sx={{ mb: 4 }}>
        <RoomsTable
          rooms={rooms}
          loading={loading}
          error={error}
        />
      </Box>
    </Container>
  );
};

export default RoomCatalogPage;
