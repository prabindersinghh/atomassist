import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import { sessionAPI, chatAPI } from '../services/api.js';
import { useSessionStore } from '../stores/session.js';
import { useAuthStore } from '../stores/auth.js';
import { socketAPI, initializeSocket } from '../services/socket.js';

export const SessionRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { user } = useAuthStore();
  const navigationState = location.state as {
    inviteToken?: string;
    liveKitToken?: string;
    liveKitUrl?: string;
  } | null;
  const inviteToken = navigationState?.inviteToken;
  const { messages, addMessage, setMessages } = useSessionStore();
  const [chatMessage, setChatMessage] = useState('');
  const [liveKitToken, setLiveKitToken] = useState('');
  const [liveKitUrl, setLiveKitUrl] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;
    const socket = initializeSocket();

    // Filter own messages — sender already adds via API response.
    // Use socket.off first so React StrictMode doesn't register the listener twice.
    const handleMessage = (data: any) => {
      if (!mounted || data.userId === user?.id) return;
      addMessage({
        id: data.id,
        session_id: sessionId,
        user_id: data.userId,
        content: data.content,
        type: 'text',
        read_by: [],
        created_at: data.timestamp,
      });
    };

    const load = async () => {
      try {
        await sessionAPI.getSession(sessionId);
        let lt = navigationState?.liveKitToken;
        let lu = navigationState?.liveKitUrl;

        if (!lt || !lu) {
          if (user?.role !== 'agent') return;
          const startResponse = await sessionAPI.startSession(sessionId);
          lt = startResponse.data.liveKitToken;
          lu = startResponse.data.liveKitUrl;
        }

        if (!mounted || !lt || !lu) return;
        setLiveKitToken(lt);
        setLiveKitUrl(lu);

        const messagesResponse = await chatAPI.getMessages(sessionId);
        if (mounted) setMessages(messagesResponse.data);

        socketAPI.joinSession(sessionId);
        socket.off('message'); // clear any stale listeners (incl. StrictMode duplicate)
        socket.on('message', handleMessage);
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };

    load();

    return () => {
      mounted = false;
      socket.off('message', handleMessage);
      socketAPI.leaveSession(sessionId);
    };
  }, [sessionId, user?.id, user?.role, navigationState]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !sessionId) return;
    const text = chatMessage;
    setChatMessage('');

    try {
      const response = await chatAPI.sendMessage(sessionId, text);
      addMessage(response.data); // sender sees their own message immediately from API
      socketAPI.sendMessage(sessionId, text); // other users receive via socket
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatMessage(text); // restore on failure
    }
  };

  if (!liveKitToken || !liveKitUrl) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center text-white">
        Loading session...
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={liveKitToken}
      connect={true}
      serverUrl={liveKitUrl}
      className="h-screen bg-[#111827]"
    >
      {/* Outer column: optional banner on top, then main row below */}
      <div className="flex flex-col h-screen w-full bg-[#111827]">
        {inviteToken && (
          <div className="bg-[#1a1f2e] border-b border-gray-700 px-4 py-2 text-white flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Invite token</span>
              <span className="font-mono font-bold text-[#FFC107]">{inviteToken}</span>
            </div>
            <span className="text-xs text-gray-400 truncate">
              {`${window.location.origin}/join?code=${inviteToken}`}
            </span>
          </div>
        )}

        {/* Main row: video + chat */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video area */}
          <div className="flex-1 overflow-hidden">
            <VideoConference />
          </div>

          {/* Chat sidebar */}
          <div className="w-80 bg-[#1a1f2e] border-l border-gray-700 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-semibold text-white text-sm">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-semibold text-[#FFC107] text-xs">{msg.user_id}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-2 bg-[#FFC107] text-[#0B0F19] rounded-lg font-semibold text-sm hover:bg-[#FFD54F] transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LiveKitRoom>
  );
};
