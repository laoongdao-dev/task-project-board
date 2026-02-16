"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface RegisteredUser {
  email: string
  password: string
  name: string
}

interface RegistrationContextType {
  registeredUsers: RegisteredUser[]
  registerUser: (user: RegisteredUser) => boolean
  userExists: (email: string) => boolean
  validateLogin: (email: string, password: string) => RegisteredUser | null
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load registered users from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("registeredUsers")
    if (storedUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedUsers))
      } catch (error) {
        console.error("Failed to parse stored users:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const registerUser = (user: RegisteredUser): boolean => {
    // Check if user already exists
    if (registeredUsers.some((u) => u.email === user.email)) {
      return false
    }

    const updatedUsers = [...registeredUsers, user]
    setRegisteredUsers(updatedUsers)
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
    return true
  }

  const userExists = (email: string): boolean => {
    return registeredUsers.some((u) => u.email === email)
  }

  const validateLogin = (email: string, password: string): RegisteredUser | null => {
    const user = registeredUsers.find((u) => u.email === email && u.password === password)
    return user || null
  }

  return (
    <RegistrationContext.Provider value={{ registeredUsers, registerUser, userExists, validateLogin }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (context === undefined) {
    throw new Error("useRegistration must be used within a RegistrationProvider")
  }
  return context
}
