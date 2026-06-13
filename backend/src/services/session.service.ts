import { supabaseAdmin } from '../config/supabase.js';
import { Session, Participant, Recording } from '../types/index.js';
import { generateSessionCode } from '../utils/id.js';

export class SessionService {
  async createSession(agentId: string): Promise<Session> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        agent_id: agentId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Session | null;
  }

  async getSessionsByAgent(agentId: string): Promise<Session[]> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Session[];
  }

  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<Session> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update({ status })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as Session;
  }

  async endSession(sessionId: string): Promise<Session> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update({
        status: 'ended',
        end_time: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as Session;
  }

  async getActiveSessions(): Promise<Session[]> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data as Session[];
  }

  async addParticipant(
    sessionId: string,
    userId: string,
    role: 'agent' | 'customer'
  ): Promise<Participant> {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Participant;
  }

  async removeParticipant(participantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('participants')
      .update({ left_at: new Date().toISOString() })
      .eq('id', participantId);

    if (error) throw error;
  }

  async getParticipants(sessionId: string): Promise<Participant[]> {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    return data as Participant[];
  }

  async updateAISummary(
    sessionId: string,
    aiSummary: Session['ai_summary']
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('sessions')
      .update({ ai_summary: aiSummary })
      .eq('id', sessionId);

    if (error) throw error;
  }

  async createInviteToken(sessionId: string): Promise<string> {
    const code = generateSessionCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('invite_tokens')
      .insert({
        token: code,
        session_id: sessionId,
        expires_at: expiresAt,
      });

    if (error) throw error;
    return code;
  }

  async validateInviteToken(token: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('invite_tokens')
      .select('session_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data.session_id;
  }

  async createRecording(sessionId: string): Promise<Recording> {
    const { data, error } = await supabaseAdmin
      .from('recordings')
      .insert({
        session_id: sessionId,
        status: 'recording',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Recording;
  }

  async updateRecordingStatus(
    recordingId: string,
    status: Recording['status'],
    metadata?: Partial<Recording>
  ): Promise<void> {
    const updates = {
      status,
      ...metadata,
      ...(status === 'ready' && { completed_at: new Date().toISOString() }),
    };

    const { error } = await supabaseAdmin
      .from('recordings')
      .update(updates)
      .eq('id', recordingId);

    if (error) throw error;
  }
}

export const sessionService = new SessionService();
