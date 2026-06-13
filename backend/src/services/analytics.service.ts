import { supabaseAdmin } from '../config/supabase.js';
import { AuditLog, SystemMetric } from '../types/index.js';

export class AnalyticsService {
  async trackEvent(
    eventName: string,
    userId: string | undefined,
    sessionId: string | undefined,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_name: eventName,
          user_id: userId,
          session_id: sessionId,
          event_data: data,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async logAudit(
    action: string,
    actorId: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, any>
  ): Promise<AuditLog> {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action,
        actor_id: actorId,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AuditLog;
  }

  async getMetrics(metricName: string, hours: number = 24): Promise<SystemMetric[]> {
    const { data, error } = await supabaseAdmin
      .from('system_metrics')
      .select('*')
      .eq('metric_name', metricName)
      .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data as SystemMetric[];
  }

  async recordMetric(metricName: string, value: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('system_metrics')
      .insert({
        metric_name: metricName,
        value,
      });

    if (error) throw error;
  }

  async getAuditLogs(resourceId?: string, limit: number = 100): Promise<AuditLog[]> {
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as AuditLog[];
  }

  async getSessionStats(): Promise<{
    activeSessions: number;
    totalSessions: number;
    avgDuration: number;
    recordingCount: number;
  }> {
    const { data: active } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('status', 'active');

    const { data: total } = await supabaseAdmin
      .from('sessions')
      .select('id');

    const { data: recordings } = await supabaseAdmin
      .from('recordings')
      .select('id')
      .eq('status', 'ready');

    const activeSessions = active?.length || 0;
    const totalSessions = total?.length || 0;
    const recordingCount = recordings?.length || 0;

    // Calculate average duration (simplified)
    const avgDuration = 0; // Would aggregate from recordings

    return {
      activeSessions,
      totalSessions,
      avgDuration,
      recordingCount,
    };
  }
}

export const analyticsService = new AnalyticsService();
