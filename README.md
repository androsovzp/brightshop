# BRIGHT SHOP 🔥

**BRIGHT SHOP** — Next.js-оболонка для Shopify-магазину. Мерч із характером для тих, хто не боїться бути собою.

---

## Стек технологій

| Технологія | Версія | Призначення |
|---|---|---|
| [Next.js](https://nextjs.org/) | 14.2.10 | Фреймворк (Pages Router) |
| [React](https://react.dev/) | 18 | UI-бібліотека |
| [Shopify Storefront API](https://shopify.dev/docs/api/storefront) | 2024-01 | Дані магазину, кошик, чекаут |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Стилізація |
| [Lucide React](https://lucide.dev/) | 0.344 | Іконки |
| [Docker](https://www.docker.com/) | — | Контейнеризація (production) |

---

## Структура проекту

```
bright-shop/
├── components/
│   ├── Header.jsx          # Фіксована шапка з анімованим рядком, навігацією та лічильником кошика
│   ├── Footer.jsx          # Підвал із навігацією та копірайтом
│   ├── Layout.jsx          # Обгортка сторінки: <Head>, Header, Footer, Cart Drawer
│   └── Customizer.jsx      # Конструктор мерчу з завантаженням зображення
├── context/
│   └── CartContext.jsx     # Глобальний стан кошика (createCart / addToCart / removeFromCart)
├── lib/
│   └── shopify.js          # Клієнт Shopify Storefront GraphQL API
├── pages/
│   ├── _app.jsx            # Обгортка додатку з CartProvider
│   ├── index.jsx           # Головна сторінка (Hero + Featured Products)
│   ├── catalog.jsx         # Каталог товарів із фільтрацією за категоріями
│   ├── about.jsx           # Сторінка "Про бренд"
│   ├── customizer.jsx      # Сторінка конструктора
│   └── product/
│       └── [handle].jsx    # Динамічна сторінка продукту
├── styles/
│   └── globals.css         # Глобальні стилі
├── public/
│   ├── photos/             # Мокап-зображення для конструктора
│   └── favicon.png
├── .env                    # Змінні середовища (не в git)
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose для production-запуску
├── next.config.js          # Конфігурація Next.js (standalone output)
└── shopify_products.csv    # Файл для імпорту товарів у Shopify Admin
```

---

## Функціональність

### Сторінки
| Маршрут | Сторінка | Опис |
|---|---|---|
| `/` | Головна | Hero-секція + 3 featured-товари з Shopify |
| `/catalog` | Каталог | Усі товари з фільтрацією: Усе / Одяг / Шопери / Носки |
| `/product/[handle]` | Продукт | Деталі товару, вибір варіанту, додавання до кошика |
| `/customizer` | Конструктор | Кастомізація принту на футболці або світшоті |
| `/about` | Про бренд | Маніфест бренду та переваги |

### Кошик
- Глобальний стан через `CartContext` (React Context API)
- Кошик створюється через Shopify Cart API та зберігається в `localStorage`
- Слайдова бічна панель кошика (`Cart Drawer`) доступна з будь-якої сторінки
- Перехід на чекаут Shopify за кнопкою "ОФОРМИТИ"

### Конструктор мерчу (`/customizer`)
1. Вибір базового виробу: **Premium T-Shirt** або **Oversized Sweatshirt**
2. Вибір кольору (Білий / Чорний / Рожевий / Червоний) — накладається через `mix-blend-multiply`
3. Завантаження власного зображення (PNG/JPG)
4. Налаштування позиції, масштабу та кута повороту принту
5. Додавання до кошика з атрибутами кастомізації (колір, позиція X/Y, масштаб)

### Shopify API (`lib/shopify.js`)
| Функція | Опис |
|---|---|
| `getAllProducts()` | Список перших 25 продуктів із зображеннями та варіантами |
| `getProduct(handle)` | Дані одного продукту за handle |
| `createCart()` | Створення нового кошика |
| `addToCart(cartId, lines)` | Додавання товару до кошика |
| `removeFromCart(cartId, lineIds)` | Видалення рядка з кошика |

---

## Локальний запуск

### 1. Встановити залежності

```bash
npm install
```

### 2. Налаштувати змінні середовища

Скопіювати `.env` або створити вручну:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
```

> **Де взяти токен?**  
> Shopify Admin → Apps → Develop apps → Create an app → Configure Storefront API → Generate token.

### 3. Запустити dev-сервер

```bash
npm run dev
# або
run_shop.bat
```

Відкрити: [http://localhost:3000](http://localhost:3000)

---

## Production (Docker)

### Через Docker Compose

```bash
docker-compose up --build
```

Або з передачею токена:

```bash
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token docker-compose up --build
```

### Через batch-файл (Windows)

```bat
run_docker.bat
```

Застосунок буде доступний на [http://localhost:3000](http://localhost:3000).

---

## Конфігурація Next.js

```js
// next.config.js
const nextConfig = {
  output: 'standalone',        // Оптимізований standalone-build для Docker
  images: {
    domains: ['cdn.shopify.com'],  // Дозволений хост для зображень Shopify
  },
}
```

---

## Компоненти

### `<Layout>`
Обгортає кожну сторінку. Приймає пропси:
- `title` — мета-заголовок сторінки (за замовчуванням: `"BRIGHT SHOP | Мерч із характером"`)
- `isHome` — `true` для прозорого хедера на головній сторінці

### `<Header>`
- Рядок-анонс із marquee-анімацією (безкоштовна доставка, новий дроп)
- Прозорий на головній сторінці, білий при прокручуванні або на інших сторінках
- Кнопка кошика з badge-лічильником
- Мобільне fullscreen-меню

### `<Customizer>`
- Lazy-завантаження продуктів Shopify (`futbolka-oversayz`, `svitshot-oversayz`)
- Накладання кольору через CSS `mix-blend-multiply`
- Слайдери для масштабу (5–80%) та повороту (-180° до +180°)

---

## Скрипти

```bash
npm run dev      # Запуск в режимі розробки
npm run build    # Production build
npm run start    # Запуск production-сервера
npm run lint     # Перевірка коду ESLint
```

---

## Автор

**BRIGHT LOOK MERCH GROUP** © 2024
