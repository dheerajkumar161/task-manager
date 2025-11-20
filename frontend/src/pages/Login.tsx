import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

type FormState = {
  username: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<'admin' | 'user'>('user');
  const [form, setForm] = useState<FormState>({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleModeChange = (nextMode: 'admin' | 'user') => {
    if (mode === nextMode) return;
    setMode(nextMode);
    setForm({ username: '', password: '' });
    setError('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/login', form);
      if (data.user.role !== mode) {
        throw new Error(
          `This account is a ${data.user.role}. Please switch to the ${
            data.user.role === 'admin' ? 'admin' : 'user'
          } login.`
        );
      }
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-500">Welcome Back</p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Sign in to Task Manager
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Use the toggle below to switch between user and admin login.
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('user')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            mode === 'user'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Login as User
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('admin')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            mode === 'admin'
              ? 'bg-brand text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Login as Admin
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 border border-slate-200 rounded-2xl p-8 shadow-sm bg-white"
      >
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {mode === 'admin'
              ? 'Full control over teams & tasks'
              : 'Manage your own tasks'}
          </p>
          <h3 className="text-2xl font-semibold text-slate-900 mt-1">
            {mode === 'admin' ? 'Admin Login' : 'User Login'}
          </h3>
        </div>
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`btn-primary w-full ${
            mode === 'admin' ? 'bg-brand hover:bg-brand/90' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {loading ? 'Signing in…' : `Login as ${mode}`}
        </button>
        <p className="text-xs text-center text-slate-500">
          Currently logging in as{' '}
          <span className="font-semibold capitalize">{mode}</span>
        </p>
      </form>
      <p className="text-sm text-center text-slate-600">
        Need an account?{' '}
        <Link className="text-brand font-medium" to="/register">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
