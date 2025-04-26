import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function ServerLogo({ 
  className = '', 
  size = 'md',
  href = '/homepage'
}: LogoProps) {
  // Size mapping for responsive logo sizing
  const sizeMap = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-24 w-auto"
  };

  return (
    <Link href={href} className={`block ${className}`}>
      <Image
        src="/images/hpg-logo.png"
        alt="HPG Logo"
        width={240}  
        height={160}
        className={`${sizeMap[size]} transition-transform hover:scale-105`}
        priority
        quality={100}
        style={{
          objectFit: 'contain',
          filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))'
        }}
      />
    </Link>
  )
} 