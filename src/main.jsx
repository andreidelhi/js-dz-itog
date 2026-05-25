import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createServer, Model } from 'miragejs' // Импортируем MirageJS
import './index.css'
import App from './App.jsx'

// Настраиваем фейковый сервер MirageJS
createServer({
  models: {
    task: Model, // Создаем модель данных для задач
  },

  seeds(server) {
    // Начальные данные, которые появятся при загрузке страницы
    server.create('task', { title: 'Изучить теорию React', priority: 'high', isDone: false })
    server.create('task', { title: 'Настроить деплой на GitHub Pages', priority: 'normal', isDone: true })
    server.create('task', { title: 'Сдать домашку преподавателю', priority: 'high', isDone: false })
  },

  routes() {
    this.namespace = 'api' // Все запросы, начинающиеся с /api, пойдут сюда

    // 1. Получение списка задач: GET /api/tasks
    this.get('/tasks', (schema) => {
      // Возвращаем массив задач (разворачиваем из базы Mirage)
      return schema.tasks.all().models.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        isDone: task.isDone,
      }))
    })

    // 2. Создание новой задачи: POST /api/tasks
    this.post('/tasks', (schema, request) => {
      const attrs = JSON.parse(request.requestBody)
      
      // Добавляем задачу в фейковую БД, проставляя по умолчанию id и статус
      const newTask = schema.tasks.create({
        title: attrs.title,
        priority: attrs.priority,
        isDone: false
      })
      
      return newTask.attrs
    })

    // 3. Отметка выполнения: POST /api/tasks/:id/complete
    this.post('/tasks/:id/complete', (schema, request) => {
      const id = request.params.id
      const task = schema.tasks.find(id)
      
      if (task) {
        task.update({ isDone: true })
        return task.attrs
      }
      
      return new Response(404, {}, { error: 'Task not found' })
    })
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)