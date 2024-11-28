interface ServerResponse<T> {
  code: number
  data: T
  message: string
}

interface AuthResponse {
  Credential: string
}
