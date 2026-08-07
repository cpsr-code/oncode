import { z } from 'zod';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topics: z.string().min(1, 'At least one topic is required'), 
  constraints: z.string().min(1, 'At least one constraint is required'), 
});

export default problemSchema;