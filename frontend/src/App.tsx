import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Импортируем Header из папки (подхватит index.ts)
import { Header } from './components/Header';
import RoomCatalogPage from './pages/RoomCatalogPage';
import BookingsPage from './pages/BookingsPage';

import './App.css';

// Создаем светлую тему
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f7f9fc',
    }
  },
});

function App() {
  // Состояние активной вкладки. По умолчанию 'catalog'.
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <ThemeProvider theme={lightTheme}>
      {/* CssBaseline нормализует стили */}
      <CssBaseline />

      {/* Header теперь получает пропсы для управления состоянием */}
      <Header
        activeNavId={activeTab}
        onNavigate={setActiveTab}
        onBellClick={() => console.log('Уведомления')}
      />

      <main>
        {/* Условный рендеринг: показываем страницу только если выбрана вкладка 'catalog' */}
        {activeTab === 'catalog' && (
          <RoomCatalogPage />
        )}

        {/* Заглушка для других страниц, чтобы было видно переключение */}
        {activeTab === 'bookings' && (
          <BookingsPage />
        )}
      </main>
    </ThemeProvider>
  )
}

export default App;
