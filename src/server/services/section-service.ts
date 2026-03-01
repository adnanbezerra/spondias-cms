import {
    prismaCategoryRepository,
    type CategoryRepository,
} from "@/src/server/repositories/category-repository";
import {
    prismaSectionRepository,
    type SectionRecord,
    type SectionRepository,
} from "@/src/server/repositories/section-repository";
import { ConflictError, NotFoundError, ValidationError } from "@/src/server/shared/errors";
import { left, right, type Either } from "@/src/server/shared/either";
import {
    sectionCategoriesOutputSchema,
    sectionOutputSchema,
    type SectionCreateInput,
    type SectionUpdateInput,
} from "@/src/server/validators/section";

export type SectionError = ConflictError | NotFoundError | ValidationError;

export class SectionService {
    constructor(
        private readonly sectionRepository: SectionRepository = prismaSectionRepository,
        private readonly categoryRepository: CategoryRepository = prismaCategoryRepository,
    ) {}

    async list(): Promise<Either<never, SectionRecord[]>> {
        const sections = await this.sectionRepository.list();
        return right(sections.map((item) => sectionOutputSchema.parse(item)));
    }

    async getById(id: string): Promise<Either<SectionError, SectionRecord>> {
        const section = await this.sectionRepository.findById(id);
        if (!section) {
            return left(new NotFoundError("Seção não encontrada."));
        }

        return right(sectionOutputSchema.parse(section));
    }

    async create(input: SectionCreateInput): Promise<Either<SectionError, SectionRecord>> {
        const found = await this.sectionRepository.findByName(input.name);
        if (found) {
            return left(new ConflictError("Seção já cadastrada."));
        }

        const created = await this.sectionRepository.create({
            name: input.name,
            isActive: input.isActive,
            order: input.order,
            isBanner: input.isBanner,
            bannerImg: input.bannerImg ?? null,
        });

        return right(sectionOutputSchema.parse(created));
    }

    async update(id: string, input: SectionUpdateInput): Promise<Either<SectionError, SectionRecord>> {
        if (input.name) {
            const foundByName = await this.sectionRepository.findByName(input.name);
            if (foundByName && foundByName.id !== id) {
                return left(new ConflictError("Nome da seção já utilizado."));
            }
        }

        const updated = await this.sectionRepository.update(id, input);
        if (!updated) {
            return left(new NotFoundError("Seção não encontrada."));
        }

        return right(sectionOutputSchema.parse(updated));
    }

    async delete(id: string): Promise<Either<SectionError, { deleted: true }>> {
        const deleted = await this.sectionRepository.delete(id);
        if (!deleted) {
            return left(new NotFoundError("Seção não encontrada."));
        }

        return right({ deleted: true });
    }

    async replaceCategories(
        id: string,
        categoryIds: string[],
    ): Promise<Either<SectionError, { updated: true }>> {
        const section = await this.sectionRepository.findById(id);
        if (!section) {
            return left(new NotFoundError("Seção não encontrada."));
        }

        const uniqueCategoryIds = [...new Set(categoryIds)];
        const categories = await Promise.all(
            uniqueCategoryIds.map((categoryId) => this.categoryRepository.findById(categoryId)),
        );
        const missingCategoryId = categories.findIndex((category) => !category);
        if (missingCategoryId >= 0) {
            return left(new ValidationError("Uma ou mais categorias informadas não existem."));
        }

        await this.sectionRepository.replaceCategories(id, uniqueCategoryIds);
        return right({ updated: true });
    }

    async listCategoryIds(
        id: string,
    ): Promise<Either<SectionError, { categoryIds: string[] }>> {
        const section = await this.sectionRepository.findById(id);
        if (!section) {
            return left(new NotFoundError("Seção não encontrada."));
        }

        const categoryIds = await this.sectionRepository.listCategoryIds(id);
        return right(sectionCategoriesOutputSchema.parse({ categoryIds }));
    }
}
