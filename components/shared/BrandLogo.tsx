import Link from "next/link";
/** A CSS viewport of the actual logo in the supplied brand sheet; no redrawn logo. */
export function BrandLogo({ href = "/", large = false }: { href?: string; large?: boolean }) { return <Link href={href} className={`brand-logo${large ? " brand-logo-large" : ""}`} aria-label="آجر آذرشین؛ صفحه اصلی"><span role="img" aria-label="نشان آجر آذرشین" /></Link>; }
