import * as React from 'react';
import { Typography, Container, Box, Grid, Button } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BuildIcon from '@mui/icons-material/Build';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';

// Импорт твоих компонентов
import SummaryCard from '../components/SummaryCard';
import FiltersAndSearch from '../components/FiltersAndSearch';
// Импортируем нашу новую "умную" таблицу
import { RoomsTable } from '@/components/RoomsTable';

const RoomCatalogPage: React.FC = () => {
  // Данные карточек
  const summaryData = [
    {
      title: 'Всего аудиторий',
      value: 24,
      icon: <MeetingRoomIcon />,
      iconColor: '#E3F2FD',
      tagLabel: '+12%',
      tagColor: 'success' as const,
      tagVariant: 'outlined' as const
    },
    {
      title: 'Доступные сейчас',
      value: 18,
      icon: <CheckCircleIcon />,
      iconColor: '#E8F5E9',
      tagLabel: 'Активно',
      tagColor: 'success' as const,
      tagVariant: 'filled' as const
    },
    {
      title: 'Забронированы',
      value: 6,
      icon: <CalendarMonthIcon />,
      iconColor: '#FFF3E0',
      tagLabel: 'Занято',
      tagColor: 'warning' as const,
      tagVariant: 'filled' as const
    },
    {
      title: 'Единиц оборудования',
      value: 156,
      icon: <BuildIcon />,
      iconColor: '#F3E5F5',
      tagLabel: 'Обновлено',
      tagColor: 'default' as const,
      tagVariant: 'filled' as const
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>

      {/* Шапка страницы */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Каталог аудиторий
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Управляйте информацией об аудиториях, их оборудовании и местоположением
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="inherit" startIcon={<FileDownloadIcon />}>
            Экспорт JSON
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadIcon />}>
            Импорт JSON
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Добавить аудиторию
          </Button>
        </Box>
      </Box>

      {/* Карточки статистики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SummaryCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Фильтры */}
      <FiltersAndSearch />

      {/* Таблица */}
      <Box sx={{ mb: 4 }}>

        <RoomsTable />
      </Box>
    </Container>
  );
};

export default RoomCatalogPage;
