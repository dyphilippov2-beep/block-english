# Напоминания об уроке

Каждый день в 16:00 и 19:00 по Тюмени Дмитрию и Никите приходит напоминание пройти урок:
push от самого приложения и (по желанию) сообщение в Telegram.
Отправляет GitHub Actions (`.github/workflows/lesson-reminders.yml`), свой сервер не нужен.

## Приложение

Block English открывается по адресу https://dyphilippov2-beep.github.io/block-english/
(GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`).

## Push

1. **Секрет.** Settings → Secrets and variables → Actions → New repository secret:
   `VAPID_PRIVATE_KEY` — закрытый ключ push. Открытый ключ уже есть в `index.html`
   и в workflow; если меняете пару ключей, поменяйте его в обоих местах
   (или задайте переменную `VAPID_PUBLIC_KEY`).
2. **На каждом телефоне** (iPhone с iOS 16.4+): откройте адрес выше в Safari →
   «Поделиться» → «На экран „Домой“». Откройте приложение с экрана «Домой» →
   Родителям → «Включить напоминания» → разрешить.
3. **Код телефона.** Там же нажмите «Скопировать» и добавьте код строкой в
   `reminders/subscriptions.txt`. Коды не секретные: без закрытого ключа по ним ничего не отправить.

## Telegram (по желанию)

1. В Telegram: @BotFather → `/newbot` → токен. Дмитрий и Никита открывают бота и жмут «Старт».
2. Секреты: `TELEGRAM_BOT_TOKEN` — токен; `TELEGRAM_CHAT_IDS` — id через запятую.
   Узнать id: Actions → Lesson reminders → Run workflow → `chats`.

## Настройки (Settings → Variables, необязательно)

- `REMIND_TZ` — часовой пояс, по умолчанию `Asia/Yekaterinburg` (Тюмень, UTC+5);
- `REMIND_HOURS` — часы, по умолчанию `16,19`;
- `APP_URL` — ссылка на приложение.

## Проверка

Actions → Lesson reminders → Run workflow → `test`: напоминание придёт сразу.
GitHub иногда запускает расписание с опозданием на 5–15 минут.
