declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        name: string;
        email: string;
        credits: number;
        createdAt: Date;
      };
    }
  }
}

export {};
