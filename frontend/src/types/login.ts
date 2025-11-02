export interface StudentLogin {
  name: string;
  id: number;
};

export type StudentLoginCardProps = {
  user: string;
  onPress: () => void;
}