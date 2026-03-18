import {
    prismaProductRepository,
    type ProductRecord,
    type ProductRepository,
} from "@/src/server/repositories/product-repository";
import {
    prismaCategoryRepository,
    type CategoryRepository,
} from "@/src/server/repositories/category-repository";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "@/src/server/shared/errors";
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
        private readonly categoryRepository: CategoryRepository = prismaCategoryRepository,
    ) {}

    async list(): Promise<Either<never, ProductRecord[]>> {
        const products = await this.productRepository.list();
        return right(products.map((item) => productOutputSchema.parse(item)));
    }

    async getById(id: string): Promise<Either<ProductError, ProductRecord>> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            return left(new NotFoundError("Produto não encontrado."));
        }

        return right(productOutputSchema.parse(product));
    }

    async create(
        input: ProductCreateInput,
    ): Promise<Either<ProductError, ProductRecord>> {
        const found = await this.productRepository.findByName(input.name);
        if (found) {
            return left(new ConflictError("Produto já cadastrado."));
        }

        const uniqueCategoryIds = [...new Set(input.categoryIds)];
        const categories = await Promise.all(
            uniqueCategoryIds.map((categoryId) =>
                this.categoryRepository.findById(categoryId),
            ),
        );
        if (categories.some((category) => !category)) {
            return left(
                new ValidationError("Uma ou mais categorias não existem."),
            );
        }

        const created = await this.productRepository.create({
            name: input.name,
            description: input.description,
            stock: input.stock,
            discountPercentage: input.discountPercentage,
            image: input.image ?? null,
            isActive: input.isActive,
            categoryIds: uniqueCategoryIds,
        });

        return right(productOutputSchema.parse(created));
    }

    async update(
        id: string,
        input: ProductUpdateInput,
    ): Promise<Either<ProductError, ProductRecord>> {
        if (input.name) {
            const foundByName = await this.productRepository.findByName(
                input.name,
            );
            if (foundByName && foundByName.id !== id) {
                return left(new ConflictError("Nome do produto já utilizado."));
            }
        }

        const uniqueCategoryIds = input.categoryIds
            ? [...new Set(input.categoryIds)]
            : undefined;

        if (uniqueCategoryIds) {
            const categories = await Promise.all(
                uniqueCategoryIds.map((categoryId) =>
                    this.categoryRepository.findById(categoryId),
                ),
            );
            if (categories.some((category) => !category)) {
                return left(
                    new ValidationError("Uma ou mais categorias não existem."),
                );
            }
        }

        const updated = await this.productRepository.update(id, {
            name: input.name,
            description: input.description,
            stock: input.stock,
            discountPercentage: input.discountPercentage,
            image: input.image,
            isActive: input.isActive,
            categoryIds: uniqueCategoryIds,
        });
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
}
