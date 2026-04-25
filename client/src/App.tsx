import './App.css'

function App() {
  return (
    <main className="login-shell">
      <section className="login-card" aria-label="Member 4 login">
        <div className="brand-block">
          <span className="eyebrow">Smart Campus</span>
          <h1>Member 4 Access</h1>
          <p>
            Sign in to manage bookings, check facilities, and keep everything in one place.
          </p>
        </div>

        <div className="status-strip">
          <span>Secure sign-in</span>
          <span>Booking ready</span>
          <span>Member 4</span>
        </div>

        <form className="login-form">
          <label>
            Email
            <input type="email" name="email" placeholder="member4@campus.edu" />
          </label>

          <label>
            Password
            <input type="password" name="password" placeholder="Enter your password" />
          </label>

          <div className="form-row">
            <label className="remember">
              <input type="checkbox" name="remember" />
              Keep me signed in
            </label>

            <a className="forgot-link" href="#">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="primary-button">
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
