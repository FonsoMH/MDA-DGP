export interface UserApiData {
  id: number;          
  name: string;
  email: string;
  role: string;
  assignedStudents?: string[];
  studentsCount?: number;
}

export interface UserFrontend {
  userId: number;
  name: string;
  email: string;
  role: string;
  assignedStudents?: string[];     
  studentsCount?: number;          
}


export interface CreateTeacherPayload {
  name: string;
  email: string;
  password: string;
  assigned_students_ids: number[]; 
}

export type Student = { id: number; name: string; email: string };

export interface PaginatedResponse<T> {
  current_page: number;
  items: T[];
  total_count: number;
  total_pages: number;
}