#!/bin/bash
# Скрипт создания нового квартирника
# Использование: ./scripts/new-event.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTENT_DIR="$PROJECT_ROOT/content/kvartirniki"
IMAGES_DIR="$PROJECT_ROOT/static/images/kv_list"

echo "=== Создание нового квартирника ==="
echo ""

# Дата
read -p "Дата (YYYY-MM-DD): " EVENT_DATE
if [[ ! "$EVENT_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Ошибка: неверный формат даты. Используйте YYYY-MM-DD"
  exit 1
fi

# Проверка на существование
if [[ -f "$CONTENT_DIR/$EVENT_DATE.md" ]]; then
  echo "Ошибка: файл $CONTENT_DIR/$EVENT_DATE.md уже существует"
  exit 1
fi

# Место
read -p "Название места: " LOCATION
read -p "Адрес (г. Нижний Новгород, ...): " ADDRESS
read -p "Ссылка на Яндекс.Карты: " MAPS_LINK

# Время
read -p "Время начала (например 19:00) [19:00]: " START_TIME
START_TIME="${START_TIME:-19:00}"

read -p "Время закрытия регистрации (мин до начала) [5]: " REG_OFFSET
REG_OFFSET="${REG_OFFSET:-5}"

# Вычислим deadline_reg_date
START_H="${START_TIME%%:*}"
START_M="${START_TIME##*:}"
TOTAL_MIN=$((START_H * 60 + START_M - REG_OFFSET))
DEADLINE_H=$((TOTAL_MIN / 60))
DEADLINE_M=$((TOTAL_MIN % 60))
DEADLINE_TIME=$(printf "%02d:%02d" $DEADLINE_H $DEADLINE_M)

# Название
read -p "Название (Квартирник в $LOCATION) [Enter — по умолчанию]: " TITLE
TITLE="${TITLE:-Квартирник в $LOCATION}"

# Описание
read -p "Краткое описание для SEO: " DESCRIPTION

# Цена
read -p "Цена (0 = бесплатно) [0]: " PRICE
PRICE="${PRICE:-0}"

# Длительность
read -p "Длительность [3 часа]: " DURATION
DURATION="${DURATION:-3 часа}"

# Контакты
CONTACTS="+7 (910) 387-27-47"
read -p "Контакты [$CONTACTS]: " CONTACTS_INPUT
CONTACTS="${CONTACTS_INPUT:-$CONTACTS}"

# Создание папки для фото
PHOTOS_DIR="$IMAGES_DIR/$EVENT_DATE"
mkdir -p "$PHOTOS_DIR"
mkdir -p "$PHOTOS_DIR/thumbs"
echo "Создана папка для фото: static/images/kv_list/$EVENT_DATE/"
echo "Создана папка для превью: static/images/kv_list/$EVENT_DATE/thumbs/"

# Создание markdown-файла
cat > "$CONTENT_DIR/$EVENT_DATE.md" << EOF
---
title: "$TITLE"
date: ${EVENT_DATE}T${START_TIME}:00+03:00
deadline_reg_date: ${EVENT_DATE}T${DEADLINE_TIME}:00+03:00
draft: true
featured_image: "/images/kv_list/$EVENT_DATE/1.webp"
time: "$START_TIME"
location: "$LOCATION"
price: "$PRICE"
address: "$ADDRESS"
contacts: "$CONTACTS"
duration: "$DURATION"
description: "$DESCRIPTION"
yandex_maps_link: "$MAPS_LINK"
eventFormat: |
  - Вход 18+
  - Бесплатно
  - Только живые инструменты
  - Выступающий может спеть до двух песен (если у вас не группа)
  - Очередность выступлений будет показываться заранее, чтобы участникам было спокойнее
  - Микрофоны, гитара и пиано есть

participants:

photos:

program:
- time: "$START_TIME"
  title: "Встреча гостей, знакомство"
- time: "$(printf "%02d:%02d" $(( (START_H * 60 + START_M + 5) / 60 )) $(( (START_H * 60 + START_M + 5) % 60 )))"
  title: "Первый сет выступлений"
- time: "$(printf "%02d:%02d" $(( (START_H * 60 + START_M + 90) / 60 )) $(( (START_H * 60 + START_M + 90) % 60 )))"
  title: "Перерыв, общение"
- time: "$(printf "%02d:%02d" $(( (START_H * 60 + START_M + 105) / 60 )) $(( (START_H * 60 + START_M + 105) % 60 )))"
  title: "Второй сет выступлений"
- time: "$(printf "%02d:%02d" $(( (START_H * 60 + START_M + 180) / 60 )) $(( (START_H * 60 + START_M + 180) % 60 )))"
  title: "Завершение вечера"
---
EOF

echo ""
echo "=== Готово! ==="
echo "Контент:  content/kvartirniki/$EVENT_DATE.md"
echo "Фото:    static/images/kv_list/$EVENT_DATE/"
echo ""
echo "Следующие шаги:"
echo "  1. Добавьте фото в static/images/kv_list/$EVENT_DATE/"
echo "  2. Отредактируйте участников и описание"
echo "  3. Установите draft: false когда всё готово"
echo "  4. hugo server -D — для предпросмотра"
