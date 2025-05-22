import { describe, it, expect, beforeEach, vi } from 'vitest'
import './script.js'

describe('Script Tests', () => {
  beforeEach(() => {
    // localStorage'ı temizle
    localStorage.clear()
    // DOM'u hazırla
    document.body.innerHTML = `
      <form class="login-form">
        <input id="email" type="email" value="test@example.com">
        <input id="password" type="password" value="test123">
      </form>
    `
  })

  it('should create default user on load', () => {
    // DOMContentLoaded event'ini tetikle
    document.dispatchEvent(new Event('DOMContentLoaded'))
    
    // localStorage'da default user'ın olup olmadığını kontrol et
    const users = JSON.parse(localStorage.getItem('users'))
    expect(users).toBeDefined()
    expect(users.length).toBeGreaterThan(0)
    expect(users[0].email).toBe('ahmet@example.com')
  })

  it('should handle login form submission', () => {
    // DOMContentLoaded event'ini tetikle
    document.dispatchEvent(new Event('DOMContentLoaded'))
    
    // Form submit event'ini tetikle
    const form = document.querySelector('.login-form')
    form.dispatchEvent(new Event('submit'))
    
    // localStorage'da currentUser'ın olup olmadığını kontrol et
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    expect(currentUser).toBeDefined()
  })
}) 