export interface UserApiData {
  id: number;          
  name: string;
  email: string;
  role: string;
  assignedStudents?: string[];
  studentsCount?: number;
  assignedTeacherId?: number | null;
}

export interface UserFrontend {
  userId: number;
  name: string;
  email: string;
  role: string;
  assignedStudents?: string[];     
  studentsCount?: number;
  assignedTeacherId?: number | null;  
}

export interface PaginatedUsersResponse {
  items: UserFrontend[]; 
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size?: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  assigned_teacher_id?: number | null;    
  assigned_students_ids?: number[];
}

export interface BaseCredentialsPayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateTeacherPayload extends BaseCredentialsPayload {
  assigned_students_ids: number[];
}

export interface CreateStudentPayload extends BaseCredentialsPayload {
  assigned_teacher: number;
}

export type Student = { id: number; name: string; email: string };

export type Teacher = { id: number; name: string; email: string };

export interface PaginatedResponse<T> {
  current_page: number;
  items: T[];
  total_count: number;
  total_pages: number;
}

export interface UserDeletionData {
    deletionId: number;
    adminName: number;
    deletedUserEmail: string;
    deletedUserName: string;
    deletedAt: string;
}
