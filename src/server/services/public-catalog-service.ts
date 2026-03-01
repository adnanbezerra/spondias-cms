import {
    getCategoryById,
    getHomeSections,
    getPublicCategories,
    getSectionById,
} from "@/src/server/public/public-content";
import { left, right, type Either } from "@/src/server/shared/either";
import { NotFoundError } from "@/src/server/shared/errors";
import {
    publicCategoriesOutputSchema,
    publicCategoryDetailsOutputSchema,
    publicSectionOutputSchema,
    type PublicCategoryDetailsOutput,
    type PublicCategoryOutput,
    type PublicSectionOutput,
} from "@/src/server/validators/public-catalog";

export type PublicCatalogError = NotFoundError;

export class PublicCatalogService {
    async listCategories(): Promise<Either<never, PublicCategoryOutput[]>> {
        const categories = await getPublicCategories();
        return right(publicCategoriesOutputSchema.parse(categories));
    }

    async listSections(): Promise<Either<never, PublicSectionOutput[]>> {
        const sections = await getHomeSections();
        return right(sections.map((section) => publicSectionOutputSchema.parse(section)));
    }

    async getCategoryById(
        id: string,
    ): Promise<Either<PublicCatalogError, PublicCategoryDetailsOutput>> {
        const category = await getCategoryById(id);

        if (!category) {
            return left(new NotFoundError("Categoria não encontrada."));
        }

        return right(publicCategoryDetailsOutputSchema.parse(category));
    }

    async getSectionById(
        id: string,
    ): Promise<Either<PublicCatalogError, PublicSectionOutput>> {
        const section = await getSectionById(id);

        if (!section) {
            return left(new NotFoundError("Seção não encontrada."));
        }

        return right(publicSectionOutputSchema.parse(section));
    }
}
