export interface User {
  id: string;
  email: string;
  displayName: string;
  hobbies: string[];
  createdAt: Date;
  level: number;
}

export interface HobbyGroup {
  id: string;
  name: string;
  description: string;
  hobby: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
}