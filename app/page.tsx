import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#DBD7CB] text-[#334D40]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
        <Image
          src="/logo.jpg"
          alt="Spondias"
          width={180}
          height={180}
          className="rounded-full border-4 border-[#334D40]/20 object-cover shadow-lg"
          priority
        />

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Spondias CMS</h1>
          <p className="mx-auto max-w-2xl text-lg">
            Base inicial do projeto concluída com autenticação server-side, validação
            de contratos com zod e estrutura de domínio para evoluir os CRUDs do admin.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 p-6 text-left shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Próximos passos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Conectar repositórios ao Prisma/PostgreSQL.</li>
            <li>Implementar CRUD de categorias, seções e produtos.</li>
            <li>Construir painel administrativo autenticado.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
