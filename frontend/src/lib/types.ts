export interface Session {
  id: string;
  title: string;
  mode: "practice" | "interview" | "conversation";
  status: "created" | "processing" | "completed" | "failed";
  duration_seconds: number;
  speech_duration_seconds: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SummaryMetrics {
  session_id: string;
  duration_seconds: number;
  speech_duration_seconds: number;
  wpm: number;
  filler_count: number;
  filler_density: number;
  pause_count: number;
  long_pause_count: number;
  average_pause_seconds: number;
  repetition_rate: number;
  type_token_ratio: number;
  sentence_count: number;
  avg_sentence_length_words: number;
  semantic_coherence_avg: number | null;
}

export interface TimelineWindow {
  window_index: number;
  window_start: number;
  window_end: number;
  wpm: number;
  word_count: number;
  filler_count: number;
  pause_count: number;
  pause_duration: number;
  coherence_score: number;
  transcript_snippet: string;
}

export interface TimelineData {
  session_id: string;
  window_size_seconds: number;
  step_size_seconds: number;
  windows: TimelineWindow[];
}

export interface WordToken {
  id: string;
  word: string;
  start_time: number;
  end_time: number;
  confidence: number;
  is_filler: boolean;
}

export interface TranscriptSegment {
  id: string;
  segment_index: number;
  text: string;
  start_time: number;
  end_time: number;
  confidence: number;
  speaker_id: string;
  words: WordToken[];
}

export interface FullTranscript {
  session_id: string;
  full_text: string;
  segments: TranscriptSegment[];
}

export interface FeedbackItem {
  id: string;
  category: "pacing" | "hesitation" | "clarity" | "structure" | "vocabulary";
  message: string;
  evidence_quote?: string;
  evidence_start?: number;
  evidence_end?: number;
  suggestion?: string;
  severity: "info" | "positive" | "caution";
}

export interface FeedbackData {
  session_id: string;
  overall_summary: string;
  items: FeedbackItem[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  title: string;
  prompt: string;
  difficulty: string;
  expected_points: string[];
  question_type?: string;
  major_concepts?: string[];
  is_custom?: boolean;
}

export interface RubricCriterionEvaluation {
  criterion: string;
  score: number;
  evidence: string;
  feedback: string;
}

export interface ConceptCoverageItem {
  concept: string;
  coverage_score: number;
  is_covered: boolean;
  evidence_sentence?: string | null;
}

export interface QuestionAnalysisResult {
  id: string;
  is_custom: boolean;
  title: string;
  prompt: string;
  category: string;
  difficulty: string;
  question_type: string;
  question_type_label: string;
  classification_method: string;
  classification_confidence: number;
  major_concepts: string[];
  expected_points: string[];
  rubric_criteria: { criterion: string; description: string }[];
  has_ground_truth: boolean;
  technical_correctness_status: string;
  technical_correctness_disclaimer: string;
}

export interface CustomQuestionInput {
  prompt: string;
  category?: string;
  title?: string;
  difficulty?: string;
  question_type?: string;
  major_concepts?: string[];
  expected_points?: string[];
  rubric_criteria?: { criterion: string; description: string }[];
}

export interface InterviewEvaluation {
  session_id: string;
  question_id: string;
  relevance_score: number;
  completeness_score: number;
  structure_score: number;
  criteria: RubricCriterionEvaluation[];
  summary_feedback: string;
  question_type?: string;
  major_concepts?: string[];
  concept_coverage?: ConceptCoverageItem[];
  communication_metrics?: {
    wpm: number;
    filler_count: number;
    filler_density: number;
    pause_count: number;
    average_pause_seconds: number;
  };
  structure_breakdown?: {
    has_introductory_framing: boolean;
    has_concluding_synthesis: boolean;
    has_signposted_transitions: boolean;
    sentence_variety: boolean;
    total_spoken_sentences: number;
  };
  has_ground_truth?: boolean;
  technical_correctness_status?: string;
  technical_correctness_disclaimer?: string;
}

export interface AnalyticsOverview {
  total_sessions: number;
  total_speech_minutes: number;
  personal_baseline: {
    mean_wpm: number;
    std_wpm?: number;
    mean_filler_density_pct: number;
    mean_pause_seconds: number;
  };
  recent_sessions: {
    id: string;
    title: string;
    mode: string;
    duration_seconds: number;
    created_at: string;
  }[];
}

export interface AnalyticsTrendPoint {
  session_id: string;
  title: string;
  created_at: string;
  wpm: number;
  filler_density: number;
  average_pause_seconds: number;
  repetition_rate: number;
  coherence: number;
}
