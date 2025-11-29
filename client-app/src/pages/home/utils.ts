function parseLocalDate(dateString: string): Date {
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
  if (dateOnlyPattern.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  return new Date(dateString)
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = parseLocalDate(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No due date'
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function getDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null
  const due = parseLocalDate(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
