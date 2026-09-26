import { 
  Session, 
  SummaryMetrics, 
  TimelineData, 
  FullTranscript, 
  FeedbackData, 
  InterviewQuestion, 
  InterviewEvaluation,
  AnalyticsOverview,
  AnalyticsTrendPoint
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function createSession(title: string, mode: "practice" | "interview" | "conversation"): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, mode }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function listSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function getSession(sessionId: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to fetch session ${sessionId}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
}

export async function uploadAndAnalyzeAudio(
  sessionId: string, 
  audioBlob: Blob, 
  questionId?: string
): Promise<{ status: string; session_id: string }> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.wav");
  if (questionId) {
    formData.append("question_id", questionId);
  }

  const res = await fetch(`${API_BASE}/sessions/${sessionId}/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function getSessionMetrics(sessionId: string): Promise<SummaryMetrics> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch session metrics");
  return res.json();
}

export async function getSessionTimeline(sessionId: string): Promise<TimelineData> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch session timeline");
  return res.json();
}

export async function getSessionTranscript(sessionId: string): Promise<FullTranscript> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/transcript`);
  if (!res.ok) throw new Error("Failed to fetch session transcript");
  return res.json();
}

export async function getSessionFeedback(sessionId: string): Promise<FeedbackData> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/feedback`);
  if (!res.ok) throw new Error("Failed to fetch session feedback");
  return res.json();
}

export async function listInterviewQuestions(): Promise<InterviewQuestion[]> {
  const res = await fetch(`${API_BASE}/interview/questions`);
  if (!res.ok) throw new Error("Failed to fetch interview questions");
  return res.json();
}

export async function evaluateInterview(sessionId: string, questionId: string): Promise<InterviewEvaluation> {
  const res = await fetch(`${API_BASE}/interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, question_id: questionId }),
  });
  if (!res.ok) throw new Error("Failed to evaluate interview response");
  return res.json();
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) throw new Error("Failed to fetch analytics overview");
  return res.json();
}

export async function getAnalyticsTrends(): Promise<{ session_count: number; trends: AnalyticsTrendPoint[] }> {
  const res = await fetch(`${API_BASE}/analytics/trends`);
  if (!res.ok) throw new Error("Failed to fetch analytics trends");
  return res.json();
}
