import { SiteFooter } from "@/src/components/public/site-footer";
import { SiteHeader } from "@/src/components/public/site-header";
import { HomeHero } from "@/src/components/public/home/home-hero";
import { HomeSections } from "@/src/components/public/home/home-sections";
import {
    getHomeSections,
    getPublicCategories,
    getPublicStoreConfig,
} from "@/src/server/public/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
    const [config, categories, sections] = await Promise.all([
        getPublicStoreConfig(),
        getPublicCategories(),
        getHomeSections(),
    ]);

    return (
        <main className="min-h-screen text-[#334D40]">
            <SiteHeader categories={categories} />
            <HomeHero config={config} categories={categories} />
            <HomeSections
                sections={sections}
                whatsappNumber={config.whatsappNumber}
            />
            <SiteFooter config={config} />
        </main>
    );
}
