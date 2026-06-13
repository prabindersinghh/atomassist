import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionAPI } from '../services/api.js';
import { useAuthStore } from '../stores/auth.js';

export const JoinSession: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [inviteToken, setInviteToken] = useState(searchParams.get('code') || '');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInviteToken(code);
    }
  }, [searchParams]);

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!inviteToken.trim()) {
      setError('Enter a valid invite token.');
      return;
    }

    setJoining(true);
    try {
      const response = await sessionAPI.joinSession(inviteToken.trim());
      const { session, liveKitToken, liveKitUrl } = response.data;

      navigate(`/agent/session/${session.id}`, {
        state: { liveKitToken, liveKitUrl },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to join this session.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-[#1a1f2e] rounded-2xl p-8 shadow-2xl border border-[#FFC107]/10">
        <h1 className="text-3xl font-bold mb-2">Join Support Session</h1>
        <p className="text-gray-400 mb-8">
          Enter the invite token shared by your support agent.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Invite token
            </label>
            <input
              type="text"
              value={inviteToken}
              onChange={(event) => setInviteToken(event.target.value)}
              className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
              placeholder="Paste invite token"
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
            disabled={joining}
            className="w-full py-2 bg-[#FFC107] text-[#0B0F19] font-semibold rounded-lg hover:bg-[#FFD54F] transition-colors disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
