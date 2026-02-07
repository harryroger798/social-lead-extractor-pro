import { ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export default function TiltCard({ 
  children, 
  className = '',
}: TiltCardProps) {
  return (
    <div className={`relative group ${className}`}>
      {children}
    </div>
  );
}
