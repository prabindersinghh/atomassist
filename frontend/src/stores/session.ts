import { create } from 'zustand';
import { Session, Participant, Message } from '../types/index.js';

interface SessionStore {
  currentSession: Session | null;
  participants: Participant[];
  messages: Message[];
  isRecording: boolean;
  recordingDuration: number;
  
  setCurrentSession: (session: Session | null) => void;
  setParticipants: (participants: Participant[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  toggleRecording: () => void;
  setRecordingDuration: (duration: number) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentSession: null,
  participants: [],
  messages: [],
  isRecording: false,
  recordingDuration: 0,

  setCurrentSession: (session) => set({ currentSession: session }),
  setParticipants: (participants) => set({ participants }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  setRecordingDuration: (duration) => set({ recordingDuration: duration }),

  reset: () =>
    set({
      currentSession: null,
      participants: [],
      messages: [],
      isRecording: false,
      recordingDuration: 0,
    }),
}));
