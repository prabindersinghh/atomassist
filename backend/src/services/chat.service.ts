import { supabaseAdmin } from '../config/supabase.js';
import { Message, FileUpload } from '../types/index.js';

export class ChatService {
  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
    type: 'text' | 'file' = 'text',
    metadata?: Record<string, any>
  ): Promise<Message> {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        content,
        type,
        metadata,
        read_by: [userId],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  }

  async getMessages(sessionId: string, limit: number = 50): Promise<Message[]> {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Message[]).reverse();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const { data: message } = await supabaseAdmin
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();

    if (message && !message.read_by.includes(userId)) {
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ read_by: [...message.read_by, userId] })
        .eq('id', messageId);

      if (error) throw error;
    }
  }

  async uploadFile(
    sessionId: string,
    userId: string,
    filename: string,
    size: number,
    type: string,
    url: string,
    previewUrl?: string
  ): Promise<FileUpload> {
    const { data, error } = await supabaseAdmin
      .from('files')
      .insert({
        session_id: sessionId,
        user_id: userId,
        filename,
        size,
        type,
        url,
        preview_url: previewUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FileUpload;
  }

  async getSessionFiles(sessionId: string): Promise<FileUpload[]> {
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FileUpload[];
  }

  async deleteFile(fileId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  }
}

export const chatService = new ChatService();
