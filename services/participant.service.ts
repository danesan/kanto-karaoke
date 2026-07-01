import { ParticipantRepository } from "@/repositories/participant.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { toParticipantDTO, toSessionDTO } from "@/services/mappers";

export class ParticipantService {
  constructor(
    private readonly participants = new ParticipantRepository(),
    private readonly sessions = new SessionRepository()
  ) {}

  async joinBySessionCode(sessionCode: string, name: string) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      throw new Error("Session not found");
    }

    const participant = await this.participants.createGuest(session.id, name.trim());

    return {
      session: toSessionDTO(session),
      participant: toParticipantDTO(participant)
    };
  }

  async getGuestInSession(participantId: string, sessionId: string) {
    const participant = await this.participants.findGuestInSession(participantId, sessionId);
    return participant ? toParticipantDTO(participant) : null;
  }
}