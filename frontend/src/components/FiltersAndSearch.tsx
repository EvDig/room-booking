import * as React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Grid,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LaptopIcon from '@mui/icons-material/Laptop';
import TvIcon from '@mui/icons-material/Tv';
import MicIcon from '@mui/icons-material/Mic';
import WifiIcon from '@mui/icons-material/Wifi';
import HelpIcon from '@mui/icons-material/Help';

// Данные для быстрых фильтров (тегов)
const quickFilters = [
  { label: 'Проектор', icon: <HelpIcon />, active: true, color: 'primary' as const },
  { label: 'Компьютер', icon: <LaptopIcon />, active: false, color: 'default' as const },
  { label: 'Интерактивная доска', icon: <TvIcon />, active: false, color: 'default' as const },
  { label: 'Микрофон', icon: <MicIcon />, active: false, color: 'default' as const },
  { label: 'Wi-Fi', icon: <WifiIcon />, active: false, color: 'default' as const },
];

const FiltersAndSearch: React.FC = () => {
  // Состояния для Select'ов (в реальном приложении)
  const [corpus, setCorpus] = React.useState('');
  const [floor, setFloor] = React.useState('');
  const [status, setStatus] = React.useState('');

  const handleCorpusChange = (event: { target: { value: string } }) => {
    setCorpus(event.target.value);
  };

  // Компонент Chip заменяем на Button для лучшего соответствия стилю макета
  const FilterButton: React.FC<{ label: string, icon: React.ReactElement, active: boolean, color: 'primary' | 'default' }> = ({ label, icon, active, color }) => (
    <Button
      variant={active ? 'contained' : 'outlined'}
      color={color === 'primary' ? 'primary' : 'inherit'}
      startIcon={icon}
      size="medium"
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        // Кастомный стиль для неактивной кнопки
        ...(color === 'default' && !active && {
          borderColor: 'rgba(0, 0, 0, 0.12)', // Тонкая серая рамка
          color: 'rgba(0, 0, 0, 0.87)',
          backgroundColor: '#f5f5f5' // Очень светлый серый фон
        })
      }}
    >
      {label}
    </Button>
  );

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: '8px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Фильтры и Поиск
        </Typography>
        <Button variant="text" color="primary" size="small" sx={{ textTransform: 'none' }}>
          Сбросить все
        </Button>
      </Box>

      {/* Ряд с поиском и выпадающими списками */}
      <Grid container spacing={2} alignItems="center" mb={2}>

        {/* Поиск */}
        <Grid item xs={12} sm={6} md={3} component="div">
          <TextField
            fullWidth
            size="medium"
            placeholder="Поиск по номеру или названию..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" sx={{ mr: 1 }} />
              ),
              sx: { borderRadius: '8px', backgroundColor: '#fff' }
            }}
          />
        </Grid>

        {/* Выпадающие списки (Select) */}
        {['Корпуса', 'Этажи', 'Статусы'].map((label, index) => (
          <Grid item xs={12} sm={6} md={3} key={label} component="div">
            <FormControl fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <Select
                value={index === 0 ? corpus : index === 1 ? floor : status}
                onChange={index === 0 ? handleCorpusChange : (e) => (index === 1 ? setFloor(e.target.value as string) : setStatus(e.target.value as string))}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  {`Все ${label}`}
                </MenuItem>
                <MenuItem value={10}>Главный корпус</MenuItem>
                <MenuItem value={20}>Корпус Б</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      {/* Ряд с быстрыми фильтрами (Тегами) */}
      <Box display="flex" flexWrap="wrap" gap={1}>
        {quickFilters.map((filter, index) => (
          <FilterButton
            key={index}
            label={filter.label}
            icon={filter.icon}
            active={filter.active}
            color={filter.color}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default FiltersAndSearch;