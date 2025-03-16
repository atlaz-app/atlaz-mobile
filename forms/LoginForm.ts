import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({ message: 'Email is required!' }).email({ message: 'Email has to be valid format!' }),
  password: z.string({ message: 'Password is required!' }).min(1, { message: 'Password is required!' }),
});

export type LoginForm = {
  email: string;
  password: string;
};
