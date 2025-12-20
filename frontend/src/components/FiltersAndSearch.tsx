import * as React from 'react';
import {
  Box, Typography, TextField, Select, MenuItem,
  FormControl, Button, Grid, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  searchRequest: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

const FiltersAndSearch: React.FC<Props> = ({
  searchRequest, onSearchChange,
  status, onStatusChange,
  onReset
}) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: '8px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Фильтры и Поиск
        </Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
          onClick={onReset} // Вызываем сброс
        >
          Сбросить все
        </Button>
      </Box>

      <Grid container spacing={2} alignItems="center">
        {/* Поиск */}
        <Grid item xs={12} sm={8} md={8}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Поиск по номеру или названию..."
            variant="outlined"
            value={searchRequest}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              sx: { borderRadius: '8px', backgroundColor: '#fff' }
            }}
          />
        </Grid>

        {/* Фильтр: Статус */}
        <Grid item xs={12} sm={4} md={4}>
          <FormControl fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
            <Select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Все Статусы</MenuItem>
              <MenuItem value="available">Доступна</MenuItem>
              <MenuItem value="reserved">Забронирована</MenuItem>
              <MenuItem value="maintenance">На обслуживании</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FiltersAndSearch;
