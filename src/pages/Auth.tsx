import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, login, register } from "../api/financeApi";
import useAuth from "../context/useAuth";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login: setToken } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const response = await login({ email, password });
        setToken(response.accessToken);
        navigate("/dashboard");
      } else {
        await register({ name, email, password });
        setMessage("Rejestracja zakończona. Teraz możesz się zalogować.");
        setMode("login");
      }
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>Finance Tracker</h1>
        <p className="muted">Logowanie i rejestracja do API</p>

        <div className="tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            type="button"
            onClick={() => setMode("login")}
          >
            Logowanie
          </button>
          <button
            className={mode === "register" ? "tab active" : "tab"}
            type="button"
            onClick={() => setMode("register")}
          >
            Rejestracja
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          {mode === "register" && (
            <label>
              Imię
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jan Kowalski"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jan@example.com"
            />
          </label>

          <label>
            Hasło
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Wysyłanie..." : mode === "login" ? "Zaloguj" : "Utwórz konto"}
          </button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
