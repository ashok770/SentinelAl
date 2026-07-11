import { Link } from 'react-router-dom'
import './AuthPage.css'

function AuthPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p>Access the SentinelAI dashboard and security workflows.</p>
        <form>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="••••••••" />
          </label>
          <button type="submit">Continue</button>
        </form>
        <p>
          New here? <Link to="/">Return to landing</Link>
        </p>
      </div>
    </section>
  )
}

export default AuthPage
