import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api.js';
import { useAuthStore } from '../stores/auth.js';
import { Session } from '../types/index.js';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [creatingSession, setCreatingSession] = useState(false);

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['agent-sessions'],
    queryFn: () => sessionAPI.getAgentSessions().then((res) => res.data),
    refetchInterval: 5000,
  });

  const handleCreateSession = async () => {
    setCreatingSession(true);
    try {
      const response = await sessionAPI.createSession();
      const { session, inviteToken } = response.data;
      navigate(`/agent/session/${session.id}`, {
        state: { inviteToken },
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Agent Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={handleCreateSession}
            disabled={creatingSession}
            className="px-6 py-3 bg-[#FFC107] text-[#0B0F19] font-semibold rounded-lg hover:bg-[#FFD54F] transition-colors disabled:opacity-50"
          >
            {creatingSession ? 'Creating...' : 'Create Session'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-[#1a1f2e] rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400 mb-4">No sessions yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/agent/session/${session.id}`)}
                className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700 hover:border-[#FFC107] cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Session {session.id.substring(0, 8)}</h3>
                    <p className="text-gray-400 text-sm">
                      Started: {new Date(session.start_time).toLocaleString()}
                    </p>
                    <div className="mt-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'active'
                            ? 'bg-green-900/30 text-[#22C55E]'
                            : session.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-gray-700/30 text-gray-400'
                        }`}
                      >
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.ai_summary && (
                      <div className="text-sm text-gray-400 bg-gray-900/20 rounded p-2">
                        ✓ Summary available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
