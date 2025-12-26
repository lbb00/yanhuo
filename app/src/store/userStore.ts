import { create } from 'zustand'

interface User {
  id: string
  phone: string
  nickname?: string
  avatar?: string
}

interface UserState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}))

