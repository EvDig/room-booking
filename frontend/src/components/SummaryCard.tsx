import * as React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

// Определение типов для пропсов компонента
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  iconColor: string; // Цвет фона для иконки (например, '#E3F2FD')
  tagLabel?: string; // Текст тега (например, "+12%", "Активно")
  tagColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  tagVariant?: 'filled' | 'outlined';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  tagLabel,
  tagColor = 'success', // По умолчанию зеленый
  tagVariant = 'filled'
}) => {
  return (
    <Card
      elevation={2} // Небольшая тень, как на макете
      sx={{
        height: '100%',
        borderRadius: '8px',
        p: 1 // Внутренний отступ для соответствия дизайну
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          {/* Блок с иконкой */}
          <Box
            sx={{
              backgroundColor: iconColor,
              padding: '12px',
              borderRadius: '8px',
              color: 'primary.main', // Цвет иконки
              '& .MuiSvgIcon-root': { fontSize: 32 } // Увеличение размера иконки
            }}
          >
            {icon}
          </Box>

          {/* Блок с тегом (+12%, Активно) */}
          {tagLabel && (
            <Chip
              label={tagLabel}
              color={tagColor}
              variant={tagVariant}
              size="small"
              sx={{
                borderRadius: '6px',
                fontWeight: 'bold',
                // Кастомизация для светлого фона и зеленого текста, как на макете
                ...(tagColor === 'success' && tagVariant === 'filled' && {
                  backgroundColor: 'rgba(56, 142, 60, 0.1)', // Очень светлый зеленый
                  color: '#388e3c', // Темно-зеленый текст
                }),
              }}
            />
          )}
        </Box>

        {/* Значение и заголовок */}
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;