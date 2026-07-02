import { hashAdminPin, verifyAdminPin } from "@/lib/admin-auth";
import { SessionRepository } from "@/repositories/session.repository";
import { toSessionDTO } from "@/services/mappers";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function generateSessionCode() {
  let code = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }

  return code;
}

function generateAdminPin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class SessionService {
  constructor(private readonly sessions = new SessionRepository()) {}

  async create(name: string, adminPin?: string) {
    const pin = adminPin?.trim() || generateAdminPin();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = generateSessionCode();
      const existing = await this.sessions.findByCode(code);

      if (!existing) {
        const session = await this.sessions.create(name.trim(), code, hashAdminPin(pin));
        return { session: toSessionDTO(session), adminPin: pin };
      }
    }

    throw new Error("Could not generate unique session code");
  }

  async get(id: string) {
    const session = await this.sessions.findActiveById(id);
    return session ? toSessionDTO(session) : null;
  }

  async getByCode(code: string) {
    const session = await this.sessions.findActiveByCode(code);
    return session ? toSessionDTO(session) : null;
  }

  async list() {
    const sessions = await this.sessions.listActive();
    return sessions.map(toSessionDTO);
  }

  async listInactive() {
    const sessions = await this.sessions.listInactive();
    return sessions.map(toSessionDTO);
  }

  async validateAdminPin(sessionCode: string, pin: string) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      return false;
    }

    return verifyAdminPin(pin, session.adminPinHash);
  }

  async updateSettings(
    sessionCode: string,
    data: {
      maxPendingPerParticipant?: number;
      maxWaitingPerParticipant?: number;
      allowDuplicates?: boolean;
      moderationEnabled?: boolean;
    }
  ) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      throw new Error("Session not found");
    }

    return toSessionDTO(await this.sessions.updateSettings(session.id, data));
  }

  async close(sessionCode: string) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      throw new Error("Session not found");
    }

    return toSessionDTO(await this.sessions.close(session.id));
  }

  async deleteInactive(sessionId: string) {
    const result = await this.sessions.deleteInactive(sessionId);

    if (result.count === 0) {
      throw new Error("Inactive session not found");
    }

    return result;
  }
}
