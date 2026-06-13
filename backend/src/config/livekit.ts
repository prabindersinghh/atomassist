import 'dotenv/config';
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

interface TokenOptions {
  metadata?: string;
  ttl?: number;
}

export const generateLiveKitToken = async (
  roomName: string,
  participantName: string,
  userId: string,
  options: Partial<TokenOptions> = {}
): Promise<string> => {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId,
    name: participantName,
    ttl: options.ttl || 86400, // 24 hours default
    metadata: options.metadata,
  });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  return await at.toJwt();
};

export const getLiveKitURL = (): string => {
  return LIVEKIT_URL;
};

export { LIVEKIT_API_KEY, LIVEKIT_API_SECRET };
