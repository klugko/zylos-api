export interface IJitsiSessionRepository {
    setMeetingUrl(projectId: string, meetingUrl: string): Promise<void>;
    getMeetingUrl(projectId: string): Promise<string | null>;
  }
  