import { supabaseAdmin } from '../config/supabase.js';
import { SessionNote, SessionTag } from '../types/index.js';

export class NotesService {
  async createNote(
    sessionId: string,
    createdBy: string,
    content: string,
    isPrivate: boolean = true
  ): Promise<SessionNote> {
    const { data, error } = await supabaseAdmin
      .from('session_notes')
      .insert({
        session_id: sessionId,
        created_by: createdBy,
        content,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (error) throw error;
    return data as SessionNote;
  }

  async getNotes(sessionId: string, includePrivate: boolean = true): Promise<SessionNote[]> {
    let query = supabaseAdmin
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (!includePrivate) {
      query = query.eq('is_private', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as SessionNote[];
  }

  async updateNote(noteId: string, content: string): Promise<SessionNote> {
    const { data, error } = await supabaseAdmin
      .from('session_notes')
      .update({ content })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data as SessionNote;
  }

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('session_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }

  async addTag(
    sessionId: string,
    tag: 'installation' | 'warranty' | 'repair' | 'troubleshooting' | 'complaint' | 'other'
  ): Promise<SessionTag> {
    const { data, error } = await supabaseAdmin
      .from('session_tags')
      .insert({
        session_id: sessionId,
        tag,
      })
      .select()
      .single();

    if (error) throw error;
    return data as SessionTag;
  }

  async getTags(sessionId: string): Promise<SessionTag[]> {
    const { data, error } = await supabaseAdmin
      .from('session_tags')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    return data as SessionTag[];
  }

  async removeTag(tagId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('session_tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
  }

  async searchByTag(tag: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('session_tags')
      .select('session_id')
      .eq('tag', tag);

    if (error) throw error;
    return (data as any[])?.map((item) => item.session_id) || [];
  }
}

export const notesService = new NotesService();
