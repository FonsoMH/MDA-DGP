export interface Classes {
  name: string;
  id: number;
};

export interface StudentLogin {
  name: string;
  email: string
  id: number;
};

export interface ClassesLogin {
  id: number;
  students: StudentLogin[]
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