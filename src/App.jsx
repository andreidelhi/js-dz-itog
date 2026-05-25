import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = '/api'

const priorities = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
]

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')
  const [showOnlyOpen, setShowOnlyOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingTaskId, setPendingTaskId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function fetchTasks() {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks`)
        if (!response.ok) {
          throw new Error('Could not load tasks from the server.')
        }

        const data = await response.json()
        if (isActive) {
          setTasks(Array.isArray(data) ? data : [])
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchTasks()

    return () => {
      isActive = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          priority,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Could not create the task.')
      }

      const createdTask = await response.json()
      setTasks((currentTasks) => [createdTask, ...currentTasks])
      setTitle('')
      setPriority('normal')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleComplete(taskId) {
    setPendingTaskId(taskId)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Could not mark the task as completed.')
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, isDone: true } : task,
        ),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPendingTaskId(null)
    }
  }

  const visibleTasks = showOnlyOpen
    ? tasks.filter((task) => !task.isDone)
    : tasks

  const completedCount = tasks.filter((task) => task.isDone).length

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Домашняя работа 2. React-клиент</p>
          <h1>Список задач, связанный с Python-сервером</h1>
          <p className="hero-description">
            Создавайте задачи, отслеживайте их статус и отмечайте выполнение на
            одной странице без роутинга.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <span>{tasks.length}</span>
            <p>Всего задач</p>
          </article>
          <article>
            <span>{completedCount}</span>
            <p>Выполнено</p>
          </article>
          <article>
            <span>{tasks.length - completedCount}</span>
            <p>Активных</p>
          </article>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <p className="panel-label">Создание задачи</p>
            <h2>Отправка данных в API</h2>
          </div>

          <label className="field">
            <span>Название задачи</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: Купить ноутбук"
            />
          </label>

          <label className="field">
            <span>Приоритет</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {priorities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Создать задачу'}
          </button>

          <p className="api-note">Адрес API: {API_BASE_URL}</p>
        </form>

        <section className="panel">
          <div className="panel-heading panel-heading-row">
            <div>
              <p className="panel-label">Список задач</p>
              <h2>Данные с сервера</h2>
            </div>

            <label className="toggle">
              <input
                type="checkbox"
                checked={showOnlyOpen}
                onChange={(event) => setShowOnlyOpen(event.target.checked)}
              />
              <span>Только невыполненные</span>
            </label>
          </div>

          {error ? <p className="message error">{error}</p> : null}

          {isLoading ? <p className="message">Загрузка задач...</p> : null}

          {!isLoading && visibleTasks.length === 0 ? (
            <p className="message">
              {showOnlyOpen
                ? 'Все задачи уже выполнены.'
                : 'Пока задач нет. Создайте первую.'}
            </p>
          ) : null}

          <div className="task-list">
            {visibleTasks.map((task) => (
              <article
                className={`task-card ${task.isDone ? 'task-card-done' : ''}`}
                key={task.id}
              >
                <div className="task-main">
                  <div className="task-row">
                    <h3>{task.title}</h3>
                    <span className={`priority-pill priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="task-meta">
                    <span>ID: {task.id}</span>
                    <span>{task.isDone ? 'Выполнена' : 'В процессе'}</span>
                  </div>
                </div>

                <button
                  className="secondary-button"
                  type="button"
                  disabled={task.isDone || pendingTaskId === task.id}
                  onClick={() => handleComplete(task.id)}
                >
                  {task.isDone
                    ? 'Уже выполнена'
                    : pendingTaskId === task.id
                      ? 'Обновление...'
                      : 'Отметить выполненной'}
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
