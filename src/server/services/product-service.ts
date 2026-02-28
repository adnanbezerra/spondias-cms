import {
  prismaProductRepository,
  type ProductRecord,
  type ProductRepository,
} from "@/src/server/repositories/product-repository";
import {
  prismaSectionRepository,
  type SectionRepository,
} from "@/src/server/repositories/section-repository";
import { ConflictError, NotFoundError, ValidationError } from "@/src/server/shared/errors";
import { left, right, type Either } from "@/src/server/shared/either";
import {
  productOutputSchema,
  type ProductCreateInput,
  type ProductUpdateInput,
} from "@/src/server/validators/product";

export type ProductError = ConflictError | NotFoundError | ValidationError;

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository = prismaProductRepository,
    private readonly sectionRepository: SectionRepository = prismaSectionRepository,
  ) {}

  async list(): Promise<Either<never, ProductRecord[]>> {
    const products = await this.productRepository.list();
    return right(products.map((item) => productOutputSchema.parse(item)));
  }

  async create(input: ProductCreateInput): Promise<Either<ProductError, ProductRecord>> {
    const found = await this.productRepository.findByName(input.name);
    if (found) {
      return left(new ConflictError("Produto já cadastrado."));
    }

    const created = await this.productRepository.create({
      name: input.name,
      price: input.price,
      stock: input.stock,
      discountPercentage: input.discountPercentage,
      image: input.image ?? null,
      isActive: input.isActive,
    });

    return right(productOutputSchema.parse(created));
  }

  async update(id: string, input: ProductUpdateInput): Promise<Either<ProductError, ProductRecord>> {
    if (input.name) {
      const foundByName = await this.productRepository.findByName(input.name);
      if (foundByName && foundByName.id !== id) {
        return left(new ConflictError("Nome do produto já utilizado."));
      }
    }

    const updated = await this.productRepository.update(id, input);
    if (!updated) {
      return left(new NotFoundError("Produto não encontrado."));
    }

    return right(productOutputSchema.parse(updated));
  }

  async delete(id: string): Promise<Either<ProductError, { deleted: true }>> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      return left(new NotFoundError("Produto não encontrado."));
    }

    return right({ deleted: true });
  }

  async replaceSections(
    id: string,
    sectionIds: string[],
  ): Promise<Either<ProductError, { updated: true }>> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return left(new NotFoundError("Produto não encontrado."));
    }

    const uniqueSectionIds = [...new Set(sectionIds)];
    const sections = await Promise.all(
      uniqueSectionIds.map((sectionId) => this.sectionRepository.findById(sectionId)),
    );
    const missingSectionId = sections.findIndex((section) => !section);
    if (missingSectionId >= 0) {
      return left(new ValidationError("Uma ou mais seções informadas não existem."));
    }

    await this.productRepository.replaceSections(id, uniqueSectionIds);
    return right({ updated: true });
  }
}
