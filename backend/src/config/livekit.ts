import { AccessToken, TokenOptions } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

export const generateLiveKitToken = (
  roomName: string,
  participantName: string,
  userId: string,
  options: Partial<TokenOptions> = {}
): string => {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  at.identity = userId;
  at.name = participantName;
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    ...options,
  });

  return at.toJwt();
};

export const getLiveKitURL = (): string => {
  return LIVEKIT_URL;
};

export { LIVEKIT_API_KEY, LIVEKIT_API_SECRET };
