# React Клиент Для Задач

React-приложение для API задач из Python-домашки.

## Запуск

```powershell
npm install
npm run dev
```

Или на Windows:

```powershell
.\start_client.bat
```

По умолчанию приложение использует адрес API `http://127.0.0.1:8000`.

Если backend работает на другом хосте или порту, создайте `.env` со значением:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```
