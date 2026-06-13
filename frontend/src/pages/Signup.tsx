import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import { authAPI } from '../services/api.js';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup(email, password, name);
      const { user, token, refreshToken } = response.data;
      login(user, token, refreshToken);
      navigate('/sessions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1f2e] rounded-2xl p-8 shadow-2xl border border-[#FFC107]/10">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 mb-8">Join AtomAssist today</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-[#EF4444] rounded-lg text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#FFC107] text-[#0B0F19] font-semibold rounded-lg hover:bg-[#FFD54F] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#FFC107] hover:text-[#FFD54F] transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
