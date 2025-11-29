# 🚀 Швидкий старт для інтеграції з ботом

## Крок 1: Запуск Convex

```bash
npx convex dev
```

Після входу в акаунт, ви отримаєте **CONVEX_URL** (наприклад: `https://your-project.convex.cloud`)

## Крок 2: Приклад коду для Python бота

```python
import requests

# Ваш Convex URL (отримаєте після npx convex dev)
CONVEX_URL = "https://your-project.convex.cloud"

# Створення замовлення
def create_order(order_data):
    url = f"{CONVEX_URL}/api/orders/create"
    response = requests.post(url, json=order_data)
    return response.json()

# Отримання меню
def get_menu(partner_id):
    url = f"{CONVEX_URL}/api/menu?partnerId={partner_id}"
    response = requests.get(url)
    return response.json()

# Приклад використання
order = {
    "orderNumber": "0001",
    "telegramUserId": "123456789",
    "partnerId": "P001",  # externalId партнера
    "items": '[{"id":"1","name":"Піца","quantity":2,"price":180}]',
    "subtotal": 360,
    "deliveryAddress": "вул. Хрещатик, 1",
    "phone": "+380501234567",
    "paymentMethod": "Cash",
    "status": "New",
    "deliveryCost": 50,
    "totalAmount": 410,
    "deliveryType": "Delivery",
    "commission": 61.5,
    "isPaid": False,
    "paymentStatus": "Not Paid",
    "platformRevenue": 61.5,
    "discount": 0
}

result = create_order(order)
print(result)  # {"success": true, "orderId": "...", "orderNumber": "0001"}
```

## Крок 3: Додавання тестових даних

Після запуску `npx convex dev`, відкрийте Convex Dashboard і додайте:

1. **Користувача** (users):
   ```json
   {
     "name": "Admin",
     "email": "admin@ferrikbot.com",
     "role": "admin"
   }
   ```

2. **Партнера** (partners):
   ```json
   {
     "name": "FerrikPizza",
     "category": "Піцерія",
     "commissionRate": 15,
     "premiumTier": "Стандарт",
     "contactPhone": "+380501234567",
     "userId": "<ID користувача з кроку 1>",
     "externalId": "P001",
     "status": "Active"
   }
   ```

3. **Страву** (menuItems):
   ```json
   {
     "name": "Піца Маргарита",
     "category": "Піца",
     "description": "Класична італійська піца",
     "price": 180,
     "partnerId": "<ID партнера з кроку 2>",
     "preparationTime": 20,
     "deliveryTime": 30,
     "rating": 4.8,
     "isActive": true,
     "externalId": "1"
   }
   ```

Готово! Тепер ваш бот може створювати замовлення та отримувати меню.
