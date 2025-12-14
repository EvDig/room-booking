import React from 'react';
import clsx from "clsx";
import s from "./Header.module.css";
import type { NavItem } from "./header.types";
import { DEFAULT_NAV } from "./header.config";
import { getInitials } from "./header.utils";
import { useAuth } from "@/context/auth";
import { DomainRounded, NotificationsNoneOutlined } from "@mui/icons-material";

export interface HeaderProps {
  navItems?: NavItem[];
  activeNavId: string;
  onNavigate: (id: string) => void;
  onBellClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  navItems = DEFAULT_NAV,
  activeNavId,
  onNavigate,
  onBellClick,
}) => {
  // Достаем пользователя и методы управления авторизацией из контекста
  const { user, signIn, signOut } = useAuth();

  // Временная функция для теста: клик по аватару меняет статус
  const handleAuthTest = () => {
    if (user) {
      signOut();
    } else {
      signIn({ name: "Студент ВУЗа", id: "u1", avatarUrl: "" });
    }
  };

  return (
    <header className={s.header}>
      <div className={s.row}>
        {/* Левая зона: логотип */}
        <div className={s.brand}>
          <div className={s.logoBox} aria-hidden>
            <DomainRounded className={s.logoIc} />
          </div>
          <div className={s.app}>Room Booking</div>
        </div>

        {/* Центральная зона: навигация */}
        <nav className={s.nav} aria-label="Основная навигация">
          {navItems.map((item) => {
            const active = item.id === activeNavId;
            return (
              <button
                key={item.id}
                type="button"
                className={clsx(s.tab, active && s.tabActive)}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                {item.icon && <item.icon className={s.tabIc} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={s.spacer} />

        {/* Правая зона: действия и аватар */}
        <div className={s.right}>
          <button
            type="button"
            className={s.iconBtn}
            onClick={onBellClick}
            aria-label="Уведомления"
            title="Уведомления"
          >
            <NotificationsNoneOutlined />
          </button>

          {/* Аватарка теперь кликабельна для теста входа/выхода */}
          <div
            className={s.avatar}
            title={user?.name || "Гость (Нажми чтобы войти)"}
            onClick={handleAuthTest}
            style={{ cursor: 'pointer' }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                width={32}
                height={32}
                style={{ borderRadius: '999px' }}
              />
            ) : (
              // Если user нет, показываем "?" или инициалы
              <span>{user ? getInitials(user.name) : "?"}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
