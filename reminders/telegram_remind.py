"""Напоминание пройти урок английского в Telegram.

Запускается каждый час из GitHub Actions и отправляет сообщение, только когда
по местному времени наступил один из часов REMIND_HOURS (по умолчанию 16 и 19).

Переменные окружения:
  TELEGRAM_BOT_TOKEN  токен бота от @BotFather
  TELEGRAM_CHAT_IDS   id чатов через запятую (Дмитрий, Никита)
  REMIND_TZ           часовой пояс, например Asia/Yekaterinburg (Тюмень)
  REMIND_HOURS        часы отправки через запятую, по умолчанию 16,19
  APP_URL             ссылка на приложение (необязательно)

Команды:
  python telegram_remind.py          отправить, если сейчас час напоминания
  python telegram_remind.py --force  отправить сейчас (проверка связи)
  python telegram_remind.py chats    показать id тех, кто написал боту /start
"""
import datetime
import json
import os
import sys
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

MESSAGES = {
    16: "📚 Никита, пора пройти урок английского! Это займёт всего несколько минут.",
    19: "⏰ Напоминание: урок английского на сегодня. Если ещё не прошёл — самое время!",
}
DEFAULT_MESSAGE = "📚 Пора пройти урок английского!"


def call(token, method, **params):
    data = urllib.parse.urlencode(params).encode()
    url = f"https://api.telegram.org/bot{token}/{method}"
    with urllib.request.urlopen(url, data=data, timeout=15) as resp:
        result = json.load(resp)
    if not result.get("ok"):
        raise RuntimeError(f"{method} failed: {result}")
    return result["result"]


def show_chats(token):
    seen = {}
    for update in call(token, "getUpdates"):
        msg = update.get("message") or update.get("my_chat_member") or {}
        chat = msg.get("chat")
        if chat:
            seen[chat["id"]] = chat.get("first_name") or chat.get("title") or ""
    if not seen:
        print("Пока никто не написал боту. Откройте бота в Telegram и нажмите /start.")
    for chat_id, name in seen.items():
        print(f"{chat_id}\t{name}")


def main():
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    if sys.argv[1:] == ["chats"]:
        show_chats(token)
        return

    tz = ZoneInfo(os.environ.get("REMIND_TZ") or "Asia/Yekaterinburg")
    hours = [int(h) for h in (os.environ.get("REMIND_HOURS") or "16,19").split(",")]
    now = datetime.datetime.now(tz)
    force = "--force" in sys.argv
    if not force and now.hour not in hours:
        print(f"{now:%H:%M} {tz.key}: не время напоминания ({hours}), пропускаю")
        return

    text = MESSAGES.get(now.hour, DEFAULT_MESSAGE)
    app_url = os.environ.get("APP_URL")
    if app_url:
        text += f"\n\n👉 {app_url}"

    chat_ids = [c.strip() for c in os.environ["TELEGRAM_CHAT_IDS"].split(",") if c.strip()]
    failed = 0
    for chat_id in chat_ids:
        try:
            call(token, "sendMessage", chat_id=chat_id, text=text)
            print(f"Отправлено в {chat_id}")
        except Exception as exc:  # один недоступный чат не должен мешать остальным
            failed += 1
            print(f"Не удалось отправить в {chat_id}: {exc}")
    if failed == len(chat_ids):
        sys.exit("Ни одно напоминание не отправлено")


if __name__ == "__main__":
    main()
