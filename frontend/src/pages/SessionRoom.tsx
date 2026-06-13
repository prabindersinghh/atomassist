import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
  useToken,
} from '@livekit/components-react';
import { sessionAPI, chatAPI } from '../services/api.js';
import { useSessionStore } from '../stores/session.js';
import { useAuthStore } from '../stores/auth.js';
import { socketAPI, initializeSocket } from '../services/socket.js';
import { Message } from '../types/index.js';

export const SessionRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages } = useSessionStore();
  const [chatMessage, setChatMessage] = useState('');
  const [liveKitToken, setLiveKitToken] = useState('');
  const [liveKitUrl, setLiveKitUrl] = useState('');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');

  const token = useToken(liveKitToken, sessionId || 'default-room');

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;

      try {
        const sessionResponse = await sessionAPI.getSession(sessionId);
        const { liveKitToken: lt, liveKitUrl: lu } = sessionResponse.data;

        setLiveKitToken(lt);
        setLiveKitUrl(lu);

        // Load messages
        const messagesResponse = await chatAPI.getMessages(sessionId);
        setMessages(messagesResponse.data);

        // Initialize socket
        const socket = initializeSocket();
        socketAPI.joinSession(sessionId);

        socketAPI.onMessage((data) => {
          addMessage(data as Message);
        });

        return () => {
          socketAPI.leaveSession(sessionId);
          socket.disconnect();
        };
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };

    loadSession();
  }, [sessionId, setMessages, addMessage]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !sessionId) return;

    try {
      const response = await chatAPI.sendMessage(sessionId, chatMessage);
      addMessage(response.data);
      socketAPI.sendMessage(sessionId, chatMessage);
      setChatMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!token || !liveKitUrl) {
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
      token={token}
      connect={true}
      serverUrl={liveKitUrl}
      className="min-h-screen bg-[#111827]"
    >
      <div className="w-full h-screen flex flex-col bg-[#111827]">
        <div className="flex-1">
          <VideoConference />
        </div>

        {/* Chat sidebar */}
        <div className="w-96 bg-[#1a1f2e] border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Chat</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-[#FFC107]">{msg.user_id}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-300">{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107]"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-[#FFC107] text-[#0B0F19] rounded-lg font-semibold hover:bg-[#FFD54F] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </LiveKitRoom>
  );
};
