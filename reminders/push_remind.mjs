// Push-напоминание пройти урок: отправляет уведомление на телефоны,
// где в Block English включены уведомления (Родителям → Уведомления).
//
// Переменные окружения:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  ключи push (публичный есть в index.html)
//   PUSH_SUBSCRIPTIONS  (необязательно) коды подписок, по одному на строку
// Коды подписок берутся также из reminders/subscriptions.txt. Они не секретные:
// без закрытого ключа VAPID по ним ничего отправить нельзя.
//   REMIND_TZ, REMIND_HOURS, APP_URL — как у telegram_remind.py
//
//   node push_remind.mjs          отправить, если сейчас час напоминания
//   node push_remind.mjs --force  отправить сейчас (проверка связи)
import { existsSync, readFileSync } from "node:fs";
import webpush from "web-push";

const MESSAGES = {
  16: { title: "📚 Пора на урок!", body: "Никита, урок английского ждёт. Всего 10–15 минут — и новые блоки твои!" },
  19: { title: "⏰ Урок английского", body: "Если сегодняшний урок ещё не пройден — самое время!" },
};
const DEFAULT_MESSAGE = { title: "📚 Block English", body: "Пора пройти урок английского!" };

const tz = process.env.REMIND_TZ || "Asia/Yekaterinburg";
const hours = (process.env.REMIND_HOURS || "16,19").split(",").map(Number);
const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(new Date()));
const force = process.argv.includes("--force");
if (!force && !hours.includes(hour)) {
  console.log(`${hour}:xx ${tz}: не время напоминания (${hours}), пропускаю`);
  process.exit(0);
}

// Код подписки — base64 от JSON, который показывает приложение; принимаем и сам JSON.
const subsFile = new URL("./subscriptions.txt", import.meta.url);
const subsText = (existsSync(subsFile) ? readFileSync(subsFile, "utf8") : "").replace(/#.*$/gm, "");
const subs = `${subsText}\n${process.env.PUSH_SUBSCRIPTIONS || ""}`
  .split(/\s+/)
  .filter(Boolean)
  .map((code) => JSON.parse(code.startsWith("{") ? code : Buffer.from(code, "base64").toString("utf8")));
if (!subs.length) {
  console.log("Нет ни одной подписки: включите уведомления в приложении и добавьте код в reminders/subscriptions.txt");
  process.exit(0);
}

webpush.setVapidDetails("mailto:noreply@block-english.app", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
const payload = JSON.stringify({ ...(MESSAGES[hour] || DEFAULT_MESSAGE), url: process.env.APP_URL || "./" });

let failed = 0;
for (const [i, sub] of subs.entries()) {
  try {
    await webpush.sendNotification(sub, payload, { TTL: 3 * 3600, urgency: "high" });
    console.log(`Подписка ${i + 1}: отправлено`);
  } catch (err) {
    failed++;
    // 404/410 — телефон отписался: нужно заново включить уведомления и обновить код
    console.log(`Подписка ${i + 1}: ошибка ${err.statusCode || ""} ${err.body || err.message}`);
  }
}
if (failed === subs.length) process.exit(1);
