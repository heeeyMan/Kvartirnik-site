#!/bin/bash
# Конвертация фото события в WebP (jpg/jpeg/png → webp).
# Имена сохраняются: 1.jpg → 1.webp. Исходники после успешной конвертации удаляются
# (иначе в галерее появятся дубли — авточтение берёт и jpg, и webp).
#
# Использование:
#   ./scripts/jpg2webp.sh 2026-05-31           # папка static/images/kv_list/2026-05-31/
#   ./scripts/jpg2webp.sh path/to/folder       # произвольная папка
#   ./scripts/jpg2webp.sh 2026-05-31 --keep    # не удалять исходники
#   QUALITY=90 ./scripts/jpg2webp.sh 2026-05-31

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QUALITY="${QUALITY:-82}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "Ошибка: не найден cwebp. Установите: brew install webp"
  exit 1
fi

ARG="$1"
KEEP=false
[ "$2" = "--keep" ] && KEEP=true

if [ -z "$ARG" ]; then
  echo "Использование: ./scripts/jpg2webp.sh <дата|папка> [--keep]"
  echo "Пример:        ./scripts/jpg2webp.sh 2026-05-31"
  exit 1
fi

# Определяем папку: либо это путь, либо дата внутри kv_list
if [ -d "$ARG" ]; then
  DIR="$ARG"
elif [ -d "$PROJECT_ROOT/static/images/kv_list/$ARG" ]; then
  DIR="$PROJECT_ROOT/static/images/kv_list/$ARG"
else
  echo "Ошибка: папка не найдена ('$ARG' и static/images/kv_list/$ARG)"
  exit 1
fi

echo "=== Конвертация в WebP (q$QUALITY) ==="
echo "Папка: $DIR"

shopt -s nullglob nocaseglob
count=0
for f in "$DIR"/*.jpg "$DIR"/*.jpeg "$DIR"/*.png; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  name="${base%.*}"
  out="$DIR/$name.webp"
  if cwebp -quiet -q "$QUALITY" "$f" -o "$out"; then
    count=$((count + 1))
    if [ "$KEEP" = false ]; then rm -f "$f"; fi
    echo "  $base → $name.webp"
  else
    echo "  ОШИБКА на $base"
  fi
done
shopt -u nullglob nocaseglob

if [ "$count" -eq 0 ]; then
  echo "Не найдено jpg/jpeg/png для конвертации."
  exit 0
fi

echo ""
echo "Готово: сконвертировано $count файл(ов)."
[ "$KEEP" = false ] && echo "Исходники удалены (используйте --keep, чтобы оставить)."
echo "Галерея и превью соберутся автоматически — список photos: вести не нужно."
