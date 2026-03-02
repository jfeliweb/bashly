import Image from 'next/image';

export const Logo = () => (
  <div className="flex items-center">
    <Image
      src="/logos/wordmark-light-bg.svg"
      alt="Bashly"
      width={380}
      height={150}
      className="block h-8 w-auto dark:hidden"
    />
    <Image
      src="/logos/wordmark-dark-bg.svg"
      alt="Bashly"
      width={380}
      height={150}
      className="hidden h-8 w-auto dark:block"
    />
  </div>
);
