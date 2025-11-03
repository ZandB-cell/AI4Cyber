export enum Role {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export interface User {
  email: string;
  password: string;
  role: Role;
  fullName: string;
  profilePictureUrl?: string | null;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface Lecture {
  id: string;
  title: string;
  fileName: string;
  fileURL: string;
  fileType: string;
  textContent: string; 
  course: string;
  accessCode: string;
  quiz: QuizQuestion[] | null;
  isPublished: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StudentAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

export interface QuizFeedback {
    questionIndex: number;
    feedbackText: string;
}