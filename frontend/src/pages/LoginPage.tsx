import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/molecules/FormField';
import { Button } from '../components/atoms/Button';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // useForm registers fields and tracks errors. mode: 'onBlur' = validate when
  // the user leaves the field, instead of on every keystroke.
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      // Redirect back to where the user wanted to go, or dashboard by default.
      // location.state shape is `{ from: { pathname } }` — see PrivateRoute.
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    } catch (err) {
      // axios attaches the response message; fall back to a generic one.
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erreur de connexion';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--color-cream)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/" style={{
          display: 'block', textAlign: 'center', marginBottom: 'var(--space-8)',
          fontWeight: 600, letterSpacing: '0.15em', color: 'var(--color-ink)',
          textDecoration: 'none',
        }}>
          VET<span style={{ color: 'var(--color-accent)' }}>CARE</span>
        </Link>

        <h1 style={{ fontStyle: 'italic', textAlign: 'center', fontSize: 'var(--fs-2xl)' }}>
          Espace professionnel
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
          Connectez-vous avec votre compte VetCare.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            required
            // The register() call wires this input to RHF: ref, onChange, onBlur.
            {...register('email', {
              required: 'Email obligatoire',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Format invalide' },
            })}
            error={errors.email?.message}
          />

          <FormField
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            required
            {...register('password', {
              required: 'Mot de passe obligatoire',
              minLength: { value: 8, message: 'Au moins 8 caractères' },
            })}
            error={errors.password?.message}
          />

          {serverError && (
            <p
              role="alert"
              style={{
                background: '#F5D2CE',
                color: 'var(--color-danger)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--fs-sm)',
              }}
            >
              {serverError}
            </p>
          )}

          <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </main>
  );
}