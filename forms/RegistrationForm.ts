import { z } from 'zod';

export const registrationSchema = z
  .object({
    username: z
      .string({ message: 'Username is required!' })
      .min(8, { message: 'Username has to be at least 8 characters long!' }),
    email: z.string({ message: 'Email is required!' }).email({ message: 'Email has to be valid format!' }),
    age: z.string({ message: 'Your age is required!' }),
    experienceYears: z.string({
      message: 'Your experience years are required!',
    }),
    password: z
      .string({ message: 'Password is required!' })
      .min(8, { message: 'Password has to be at least 8 character long!' }),
    confirmPassword: z.string({
      message: 'Password confirmation is required!',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match!',
  });

export type RegistrationForm = {
  username: string;
  email: string;
  age: string;
  experienceYears: string;
  password: string;
  confirmPassword?: string;
};
