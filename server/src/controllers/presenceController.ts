import { User } from "../models/User";

export class PresenceService {
  private static onlineUsers = new Map<number, number>();
  private static OFFLINE_THRESHOLD = 5000; // 5 seconds

  static init() {
    setInterval(() => {
      this.checkOfflineUsers();
    }, 5000); // Check every 5 seconds
  }

  static updatePresence(userId: number) {
    this.onlineUsers.set(userId, Date.now());
    return User.update(
      { isOnline: true, lastSeen: new Date() },
      { where: { id: userId } }
    );
  }

  static isOnline(userId: number): boolean {
    const lastBeat = this.onlineUsers.get(userId);
    if (!lastBeat) return false;
    return Date.now() - lastBeat < this.OFFLINE_THRESHOLD;
  }

  private static async checkOfflineUsers() {
    const now = Date.now();
    for (const [userId, lastBeat] of this.onlineUsers.entries()) {
      if (now - lastBeat > this.OFFLINE_THRESHOLD) {
        this.onlineUsers.delete(userId);
        await User.update(
          { isOnline: false, lastSeen: new Date() },
          { where: { id: userId } }
        );
      }
    }
  }
}
