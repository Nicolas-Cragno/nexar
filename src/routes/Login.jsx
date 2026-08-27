import { useState } from "react";
import { Navigate } from "react-router-dom";
import Logo from "../assets/logos/LOGO_PRINCIPAL.png";
import { useAuth } from "../contexto/AuthContext";
import Loading from "./Loading";
import "./css/Login.css";

const Login = () => {
  const { authMessage, isAuthenticated, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (loading) return <Loading />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormError("");

    try {
      await login(email, password);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || !email.trim() || !password;
  const visibleError = formError || authMessage;

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <img className="login-logo" src={Logo} alt="Nexar" />
        <h1 id="login-title">Ingresar a Nexar</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="email" value={email}
            onChange={(event) => setEmail(event.target.value)} disabled={submitting}
            required autoFocus />
          <label htmlFor="login-password">Contraseña</label>
          <input id="login-password" type="password" autoComplete="current-password"
            value={password} onChange={(event) => setPassword(event.target.value)}
            disabled={submitting} required />
          {visibleError && <p className="login-error" role="alert">{visibleError}</p>}
          <button type="submit" disabled={disabled}>
            {submitting ? "INGRESANDO..." : "INGRESAR"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
