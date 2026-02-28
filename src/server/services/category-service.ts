import { inMemoryCategoryRepository, type CategoryRecord, type CategoryRepository } from "@/src/server/repositories/category-repository";
import { ConflictError, NotFoundError } from "@/src/server/shared/errors";
import { left, right, type Either } from "@/src/server/shared/either";
import { categoryOutputSchema, type CategoryCreateInput, type CategoryUpdateInput } from "@/src/server/validators/category";

export type CategoryError = ConflictError | NotFoundError;

export class CategoryService {
  constructor(private readonly repository: CategoryRepository = inMemoryCategoryRepository) {}

  async list(): Promise<Either<never, CategoryRecord[]>> {
    const categories = await this.repository.list();
    return right(categories.map((item) => categoryOutputSchema.parse(item)));
  }

  async create(input: CategoryCreateInput): Promise<Either<CategoryError, CategoryRecord>> {
    const found = await this.repository.findByName(input.name);
    if (found) {
      return left(new ConflictError("Categoria já cadastrada."));
    }

    const created = await this.repository.create({
      name: input.name,
      isActive: input.isActive,
    });

    return right(categoryOutputSchema.parse(created));
  }

  async update(id: string, input: CategoryUpdateInput): Promise<Either<CategoryError, CategoryRecord>> {
    if (input.name) {
      const foundByName = await this.repository.findByName(input.name);
      if (foundByName && foundByName.id !== id) {
        return left(new ConflictError("Nome da categoria já utilizado."));
      }
    }

    const updated = await this.repository.update(id, input);
    if (!updated) {
      return left(new NotFoundError("Categoria não encontrada."));
    }

    return right(categoryOutputSchema.parse(updated));
  }

  async delete(id: string): Promise<Either<CategoryError, { deleted: true }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      return left(new NotFoundError("Categoria não encontrada."));
    }

    return right({ deleted: true });
  }
}
