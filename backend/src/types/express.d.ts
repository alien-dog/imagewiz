import { User } from "../shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
    }
  }
}

// Extend multer's Request type
declare module "express-serve-static-core" {
  interface Request {
    file?: Express.Multer.File;
  }
}
