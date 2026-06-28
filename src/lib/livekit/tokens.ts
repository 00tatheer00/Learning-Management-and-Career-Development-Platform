import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import {
  getLiveKitConfig,
  getSessionRoomName,
  type LiveRoomRole,
} from "@/lib/livekit/config";

interface CreateLiveTokenInput {
  sessionId: string;
  userId: string;
  userName: string;
  role: LiveRoomRole;
  waitingRoom?: boolean;
}

export async function createLiveKitAccessToken(input: CreateLiveTokenInput): Promise<string> {
  const { apiKey, apiSecret } = getLiveKitConfig();
  const roomName = getSessionRoomName(input.sessionId);
  const isHost = input.role === "host" || input.role === "admin";
  const inWaitingRoom = !isHost && Boolean(input.waitingRoom);

  const token = new AccessToken(apiKey, apiSecret, {
    identity: input.userId,
    name: input.userName,
    ttl: "3h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    roomAdmin: isHost,
    canPublish: isHost || !inWaitingRoom,
    canSubscribe: isHost || !inWaitingRoom,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });

  return token.toJwt();
}

export async function admitParticipantToLiveRoom(
  sessionId: string,
  participantIdentity: string
): Promise<void> {
  const { apiKey, apiSecret, url } = getLiveKitConfig();
  const roomName = getSessionRoomName(sessionId);
  const client = new RoomServiceClient(url, apiKey, apiSecret);

  await client.updateParticipant(roomName, participantIdentity, {
    permission: {
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  });
}

export async function listLiveRoomParticipants(sessionId: string) {
  const { apiKey, apiSecret, url } = getLiveKitConfig();
  const roomName = getSessionRoomName(sessionId);
  const client = new RoomServiceClient(url, apiKey, apiSecret);
  const participants = await client.listParticipants(roomName);
  return participants;
}
