export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const order = req.body;

  const items = order.line_items
    ?.map((item) => `• ${item.title} x${item.quantity}`)
    .join('\n') || '—';

  const name = order.shipping_address
    ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
    : order.email || '—';

  const address = order.shipping_address
    ? `${order.shipping_address.city}, ${order.shipping_address.address1}`
    : '—';

  const message = [
    `🛍 *Нове замовлення #${order.order_number}*`,
    ``,
    `👤 *Клієнт:* ${name}`,
    `📧 *Email:* ${order.email || '—'}`,
    `📞 *Телефон:* ${order.phone || '—'}`,
    `📍 *Адреса:* ${address}`,
    ``,
    `📦 *Товари:*`,
    items,
    ``,
    `💰 *Сума:* ${order.total_price} ${order.currency}`,
    `💳 *Оплата:* ${order.financial_status === 'paid' ? '✅ Оплачено' : '⏳ Очікує оплати'}`,
  ].join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return res.status(500).send('Server misconfigured');
  }

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!telegramRes.ok) {
      const err = await telegramRes.text();
      console.error('Telegram API error:', err);
      return res.status(500).send('Telegram error');
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
