import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api/resources',
  headers: {
    'Content-Type': 'application/json',
  },
})

function extractMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    'Unable to contact the facilities backend.'
  )
}

export async function getResources() {
  const response = await api.get('')
  return Array.isArray(response.data) ? response.data : []
}

export async function addResource(payload) {
  const response = await api.post('', payload)
  return response.data
}

export async function editResource(id, payload) {
  const response = await api.put(`/${id}`, payload)
  return response.data
}

export async function removeResource(id) {
  await api.delete(`/${id}`)
}

export { extractMessage }
