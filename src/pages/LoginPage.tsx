import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { MOCK_CREDENTIALS } from '@/data/mockData';

export function LoginPage() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState(MOCK_CREDENTIALS.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Completá todos los campos.');
      return;
    }
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error ?? 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center glow-gold shadow-2xl">
            <Scissors className="w-7 h-7 text-zinc-950" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient-gold tracking-tight">Turnia</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestión profesional para barberías</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-zinc-100">Iniciar sesión</h2>
            <p className="text-sm text-zinc-500 mt-1">Bienvenido de nuevo</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-amber-400 font-semibold">Demo:</span>{' '}
              <span className="font-mono">{MOCK_CREDENTIALS.email}</span> /{' '}
              <span className="font-mono">{MOCK_CREDENTIALS.password}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-base"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center mt-2 py-3 text-base glow-gold"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          © {new Date().getFullYear()} Turnia. Sistema de gestión para barberías.
        </p>
      </div>
    </div>
  );
}
