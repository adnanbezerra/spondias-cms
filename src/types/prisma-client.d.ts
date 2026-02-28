declare module "@prisma/client" {
  export class PrismaClient {
    $disconnect(): Promise<void>;
  }
}
