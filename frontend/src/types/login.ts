export interface StudentLogin {
  name: string;
  email: string
  id: number;
  role: string
};

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