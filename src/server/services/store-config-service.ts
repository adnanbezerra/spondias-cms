import { prismaStoreConfigRepository, type StoreConfigRecord, type StoreConfigRepository } from "@/src/server/repositories/store-config-repository";
import { right, type Either } from "@/src/server/shared/either";
import { storeConfigOutputSchema, type StoreConfigUpdateInput } from "@/src/server/validators/store-config";

export class StoreConfigService {
  constructor(private readonly repository: StoreConfigRepository = prismaStoreConfigRepository) {}

  async get(): Promise<Either<never, StoreConfigRecord>> {
    const config = await this.repository.get();
    return right(storeConfigOutputSchema.parse(config));
  }

  async update(input: StoreConfigUpdateInput): Promise<Either<never, StoreConfigRecord>> {
    const config = await this.repository.update(input);
    return right(storeConfigOutputSchema.parse(config));
  }
}
