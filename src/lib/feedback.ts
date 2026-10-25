export type FeedbackResponse = {
  questionId: string
  answer: string
  pathname: string
  createdAt: string
}

const feedbackKey = 'specialist.testing.responses'

export function getFeedbackResponses(): FeedbackResponse[] {
  try {
    return JSON.parse(localStorage.getItem(feedbackKey) || '[]')
  } catch {
    return []
  }
}

export function saveFeedbackResponse(response: Omit<FeedbackResponse, 'createdAt'>) {
  const responses = getFeedbackResponses().filter(
    (item) => item.questionId !== response.questionId
  )
  responses.push({ ...response, createdAt: new Date().toISOString() })
  localStorage.setItem(feedbackKey, JSON.stringify(responses))
}

export function clearFeedbackResponses() {
  localStorage.removeItem(feedbackKey)
}

export function resetJourneyState() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('specialist.') && key !== feedbackKey)
    .forEach((key) => localStorage.removeItem(key))
}

export function downloadFeedbackResponses() {
  const payload = {
    product: 'Peasy Validation MVP',
    exportedAt: new Date().toISOString(),
    responses: getFeedbackResponses(),
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `specialist-feedback-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
