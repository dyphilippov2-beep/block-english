# Напоминания об уроке в Telegram

Каждый день в 16:00 и 19:00 бот пишет Дмитрию и Никите, что пора пройти урок.
Отправляет GitHub Actions (`.github/workflows/lesson-reminders.yml`), сервер не нужен.

## Настройка (один раз)

1. **Бот.** В Telegram откройте @BotFather → `/newbot` → получите токен.
   Можно взять и уже существующего бота.
2. **/start.** Дмитрий и Никита открывают бота и нажимают «Старт».
   Без этого Telegram не разрешит боту писать первым.
3. **Секреты.** В репозитории: Settings → Secrets and variables → Actions → New repository secret:
   - `TELEGRAM_BOT_TOKEN` — токен бота;
   - `TELEGRAM_CHAT_IDS` — два id через запятую, например `123456789,987654321`.
   Узнать id: Actions → Lesson reminders → Run workflow → `chats`; в логе будут id и имена.
4. **Переменные** (вкладка Variables, необязательно):
   - `REMIND_TZ` — часовой пояс, по умолчанию `Asia/Yekaterinburg` — время Тюмени (UTC+5);
   - `REMIND_HOURS` — часы, по умолчанию `16,19`;
   - `APP_URL` — ссылка на приложение, добавится в сообщение.
5. **Проверка.** Actions → Lesson reminders → Run workflow → `test` — сообщение придёт сразу.

GitHub иногда запускает расписание с опозданием на 5–15 минут.
