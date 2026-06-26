# План: Премиум-редизайн — Glassmorphism, Framer Motion, Haptic Feedback

## Изменяемые файлы

| Файл | Изменения |
|------|-----------|
| `frontend/package.json` | Добавить `framer-motion` в зависимости |
| `frontend/src/App.tsx` | Импорт framer-motion, новые стили, анимации, haptic |
| `frontend/src/styles.css` | Новые CSS-переменные для фона |
| `frontend/src/telegram.ts` | Добавить тип `HapticFeedback` |

## Пошаговый план

### ШАГ 1: Установка framer-motion
- `npm install framer-motion` в `frontend/`

### ШАГ 2: Глубокий контрастный фон и парящие блоки
- Изменить `bg-linen` на `bg-[#F4F1EA]` в корневом контейнере `App`
- Карточкам рецептов/папок добавить `border border-black/[0.03] shadow-sm`
- Модальным блокам оставить `bg-white rounded-2xl`

### ШАГ 3: Glassmorphism для Bottom Nav
- Заменить `bg-white rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)]` на `bg-white/75 backdrop-blur-lg border-t border-white/20`
- Убедиться, что `pb-24` сохраняется для контента

### ШАГ 4: Liquid Tab Bar через Framer Motion
- Импортировать `motion` и `AnimatePresence` из `framer-motion`
- Заменить статический `div`-индикатор табов на `<motion.div layoutId="tabIndicator" />`
- Добавить `layout="position"` на контейнер табов
- Настроить spring-физику: `transition={{ type: "spring", stiffness: 500, damping: 30 }}`

### ШАГ 5: Haptic Feedback
- Добавить в `telegram.ts` тип `HapticFeedback` с методами `impactOccurred` и `notificationOccurred`
- В `App.tsx` создать хелпер `function haptic(type: 'light' | 'medium' | 'heavy' | 'success')`
- Вызывать `haptic('light')` при: переключении табов, клике на папки
- Вызывать `haptic('success')` при успешном сохранении рецепта/чек-листа

### ШАГ 6: Проверка сборки
- `npx tsc --noEmit`
- `npm run build`
- `git add -A && git commit && git push`