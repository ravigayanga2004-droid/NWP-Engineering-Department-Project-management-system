import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border bg-background p-8 text-center shadow-sm">
        <Image
          src="/branding/placeholders/nwp-emblem-225.png"
          alt="North Western Province emblem"
          width={112}
          height={112}
          priority
        />
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Department of Engineering Services · North Western Province
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            School Works Management System
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign-in and the works register are being built in Phase 1.
        </p>
      </div>
    </main>
  );
}
