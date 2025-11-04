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