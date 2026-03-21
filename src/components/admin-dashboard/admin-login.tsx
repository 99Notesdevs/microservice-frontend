import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password, secret);
      navigate('/admin/permissions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign in
          </h2>
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2 text-center animate-shake">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6 animate-fade-in" onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            <div className="relative flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:shadow-none outline-none bg-transparent transition-all duration-150 placeholder-gray-400 text-gray-900 text-lg"
                placeholder="Email address"
              />
            </div>
            <div className="relative flex items-center">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:shadow-none outline-none bg-transparent transition-all duration-150 placeholder-gray-400 text-gray-900 text-lg pr-8"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="relative flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                id="secret"
                name="secret"
                type={showSecret ? 'text' : 'password'}
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="block w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-indigo-500 focus:shadow-none outline-none bg-transparent transition-all duration-150 placeholder-gray-400 text-gray-900 text-lg pr-8"
                placeholder="Admin Secret Key"
              />
              <button
                type="button"
                onClick={() => setShowSecret((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showSecret ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-2/3 mx-auto flex justify-center items-center gap-2 py-3 px-6 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
