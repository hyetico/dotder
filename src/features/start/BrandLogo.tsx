import Image from "next/image";

/**
 * 로고 그림 + 「dotder」 글자 (보드 00 · 13 머리). 테마에 맞는 그림만 보인다(.logo-light · .logo-dark).
 *
 * @example
 * <BrandLogo />
 */
export default function BrandLogo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/dotder-logo.svg"
        alt=""
        width={26}
        height={22}
        unoptimized
        className="logo-light"
      />
      <Image
        src="/brand/dotder-logo-dark.svg"
        alt=""
        width={26}
        height={22}
        unoptimized
        className="logo-dark"
      />
      <strong className="text-lg font-bold tracking-logo">dotder</strong>
    </span>
  );
}
