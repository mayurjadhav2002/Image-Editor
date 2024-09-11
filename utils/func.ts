import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
)=> {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
}


export const extractUniqueValues = <T>(items: T[], key: keyof T) => {
    return Array.from(new Set(items.map((item) => item[key]))).filter(value=>value !== null);
  };
  