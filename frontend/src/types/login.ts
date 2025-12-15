export interface StudentLogin {
  name: string;
  email: string
  id: number;
  role: string
};

export interface PaginatedStudentsResponse {
    items: StudentLogin[];
    total_count: number;
    total_pages: number;
    current_page: number;
}

export type StudentLoginCardProps = {
  user: string;
  onPress: () => void;
}


export interface LoginCredentials {
  username: string;
  password: string;
}


export interface AuthResponse {
  token: string;
  user: StudentLogin;
}