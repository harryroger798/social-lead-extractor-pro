import { motion } from 'framer-motion'
import { Smartphone, Laptop, Cpu, HardDrive, Wifi, Monitor, Wrench, Settings } from 'lucide-react'

// Floating Tech Icons Background
export function FloatingTechIcons({ variant = 'default' }: { variant?: 'default' | 'light' | 'dark' }) {
  const icons = [
    { Icon: Smartphone, delay: 0, x: '5%', y: '15%', size: 'lg' },
    { Icon: Laptop, delay: 0.5, x: '85%', y: '10%', size: 'md' },
    { Icon: Cpu, delay: 1, x: '10%', y: '75%', size: 'md' },
    { Icon: HardDrive, delay: 1.5, x: '90%', y: '65%', size: 'lg' },
    { Icon: Wifi, delay: 2, x: '45%', y: '85%', size: 'sm' },
    { Icon: Monitor, delay: 2.5, x: '75%', y: '25%', size: 'sm' },
    { Icon: Wrench, delay: 3, x: '20%', y: '45%', size: 'md' },
    { Icon: Settings, delay: 3.5, x: '65%', y: '50%', size: 'sm' },
  ]

  const sizeClasses = {
    sm: 'h-8 w-8 md:h-10 md:w-10',
    md: 'h-10 w-10 md:h-14 md:w-14',
    lg: 'h-12 w-12 md:h-16 md:w-16',
  }

  const colorClasses = {
    default: 'text-primary/10 dark:text-primary/5',
    light: 'text-white/10',
    dark: 'text-slate-900/5 dark:text-white/5',
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {icons.map(({ Icon, delay, x, y, size }, index) => (
        <motion.div
          key={index}
          className={`absolute ${colorClasses[variant]}`}
          style={{ left: x, top: y }}
          animate={{ 
            y: [0, -15, 0], 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 6, 
            delay, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        >
          <Icon className={sizeClasses[size as keyof typeof sizeClasses]} />
        </motion.div>
      ))}
    </div>
  )
}

// Wave Section Divider
export function WaveDivider({ 
  position = 'bottom', 
  color = 'white',
  className = ''
}: { 
  position?: 'top' | 'bottom'
  color?: 'white' | 'slate' | 'purple' | 'gradient'
  className?: string
}) {
  const colorClasses = {
    white: 'fill-white dark:fill-slate-900',
    slate: 'fill-slate-50 dark:fill-slate-800',
    purple: 'fill-purple-900',
    gradient: 'fill-slate-900',
  }

  return (
    <div className={`absolute ${position === 'top' ? 'top-0 rotate-180' : 'bottom-0'} left-0 right-0 overflow-hidden ${className}`}>
      <svg 
        viewBox="0 0 1440 120" 
        className={`w-full h-16 md:h-24 ${colorClasses[color]}`}
        preserveAspectRatio="none"
      >
        <path d="M0,64 C288,120 576,0 864,64 C1152,128 1296,32 1440,64 L1440,120 L0,120 Z" />
      </svg>
    </div>
  )
}

// Animated Gradient Orbs
export function GradientOrbs({ variant = 'default' }: { variant?: 'default' | 'hero' | 'subtle' }) {
  const orbConfigs = {
    default: [
      { color: 'from-cyan-500/20 to-blue-500/20', size: 'w-64 h-64', position: 'top-10 -left-32', delay: 0 },
      { color: 'from-purple-500/20 to-pink-500/20', size: 'w-96 h-96', position: 'bottom-10 -right-48', delay: 2 },
      { color: 'from-green-500/15 to-emerald-500/15', size: 'w-48 h-48', position: 'top-1/2 left-1/4', delay: 4 },
    ],
    hero: [
      { color: 'from-cyan-500/30 to-blue-500/30', size: 'w-96 h-96', position: '-top-48 -left-48', delay: 0 },
      { color: 'from-purple-500/30 to-pink-500/30', size: 'w-[500px] h-[500px]', position: '-bottom-64 -right-64', delay: 1 },
      { color: 'from-yellow-500/20 to-orange-500/20', size: 'w-72 h-72', position: 'top-1/3 right-1/4', delay: 2 },
    ],
    subtle: [
      { color: 'from-primary/10 to-purple-500/10', size: 'w-48 h-48', position: 'top-20 -left-24', delay: 0 },
      { color: 'from-cyan-500/10 to-blue-500/10', size: 'w-64 h-64', position: 'bottom-20 -right-32', delay: 1.5 },
    ],
  }

  const orbs = orbConfigs[variant]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.size} ${orb.position} rounded-full bg-gradient-to-br ${orb.color} blur-3xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Dot Grid Pattern
export function DotGridPattern({ 
  opacity = 'medium',
  color = 'default'
}: { 
  opacity?: 'light' | 'medium' | 'strong'
  color?: 'default' | 'primary' | 'white'
}) {
  const opacityClasses = {
    light: 'opacity-[0.03]',
    medium: 'opacity-[0.05]',
    strong: 'opacity-[0.08]',
  }

  const colorClasses = {
    default: 'bg-slate-900 dark:bg-white',
    primary: 'bg-primary',
    white: 'bg-white',
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div 
        className={`absolute inset-0 ${opacityClasses[opacity]}`}
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <div className={`w-full h-full ${colorClasses[color]}`} style={{ mixBlendMode: 'multiply' }} />
      </div>
    </div>
  )
}

// Circuit Board Pattern
export function CircuitPattern({ variant = 'default' }: { variant?: 'default' | 'light' | 'hero' }) {
  const colorClasses = {
    default: 'stroke-slate-200 dark:stroke-slate-700',
    light: 'stroke-white/20',
    hero: 'stroke-primary/10',
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <svg className={`absolute inset-0 w-full h-full ${colorClasses[variant]}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10 L10 50 L50 50" fill="none" strokeWidth="0.5" />
            <path d="M90 10 L90 30 L70 30 L70 70" fill="none" strokeWidth="0.5" />
            <path d="M30 90 L30 70 L60 70 L60 90" fill="none" strokeWidth="0.5" />
            <circle cx="10" cy="10" r="2" fill="currentColor" className="fill-slate-300 dark:fill-slate-600" />
            <circle cx="50" cy="50" r="2" fill="currentColor" className="fill-slate-300 dark:fill-slate-600" />
            <circle cx="90" cy="10" r="2" fill="currentColor" className="fill-slate-300 dark:fill-slate-600" />
            <circle cx="70" cy="70" r="2" fill="currentColor" className="fill-slate-300 dark:fill-slate-600" />
            <circle cx="30" cy="90" r="2" fill="currentColor" className="fill-slate-300 dark:fill-slate-600" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  )
}

// Animated Lines Background
export function AnimatedLines({ color = 'default' }: { color?: 'default' | 'light' | 'primary' }) {
  const colorClasses = {
    default: 'bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent',
    light: 'bg-gradient-to-r from-transparent via-white/20 to-transparent',
    primary: 'bg-gradient-to-r from-transparent via-primary/20 to-transparent',
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute h-px w-full ${colorClasses[color]}`}
          style={{ top: `${20 + i * 15}%` }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            delay: i * 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// Glowing Border Card
export function GlowingCard({ 
  children, 
  className = '',
  glowColor = 'primary'
}: { 
  children: React.ReactNode
  className?: string
  glowColor?: 'primary' | 'cyan' | 'purple' | 'gradient'
}) {
  const glowClasses = {
    primary: 'before:bg-primary/20',
    cyan: 'before:bg-cyan-500/20',
    purple: 'before:bg-purple-500/20',
    gradient: 'before:bg-gradient-to-r before:from-cyan-500/20 before:via-purple-500/20 before:to-pink-500/20',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative group ${className}`}
    >
      <div className={`absolute -inset-0.5 rounded-2xl ${glowClasses[glowColor]} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        {children}
      </div>
    </motion.div>
  )
}

// Sparkle Effect
export function SparkleEffect() {
  const sparkles = [...Array(20)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Mesh Gradient Background
export function MeshGradient({ variant = 'default' }: { variant?: 'default' | 'warm' | 'cool' | 'dark' }) {
  const gradients = {
    default: 'bg-gradient-to-br from-slate-50 via-purple-50/50 to-cyan-50/50 dark:from-slate-900 dark:via-purple-900/20 dark:to-cyan-900/20',
    warm: 'bg-gradient-to-br from-orange-50 via-pink-50/50 to-yellow-50/50 dark:from-slate-900 dark:via-orange-900/20 dark:to-pink-900/20',
    cool: 'bg-gradient-to-br from-blue-50 via-cyan-50/50 to-teal-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-cyan-900/20',
    dark: 'bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900',
  }

  return (
    <div className={`absolute inset-0 -z-10 ${gradients[variant]}`} />
  )
}

// Floating Particles
export function FloatingParticles({ count = 30, color = 'default' }: { count?: number; color?: 'default' | 'white' | 'primary' }) {
  const colorClasses = {
    default: 'bg-slate-400/30 dark:bg-slate-500/20',
    white: 'bg-white/30',
    primary: 'bg-primary/30',
  }

  const particles = [...Array(count)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${colorClasses[color]}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Section with Visual Enhancements
export function EnhancedSection({
  children,
  className = '',
  background = 'default',
  withOrbs = false,
  withDots = false,
  withFloatingIcons = false,
  withCircuit = false,
  withParticles = false,
  withWaveTop = false,
  withWaveBottom = false,
  waveColor = 'white',
}: {
  children: React.ReactNode
  className?: string
  background?: 'default' | 'gradient' | 'dark' | 'light' | 'mesh'
  withOrbs?: boolean
  withDots?: boolean
  withFloatingIcons?: boolean
  withCircuit?: boolean
  withParticles?: boolean
  withWaveTop?: boolean
  withWaveBottom?: boolean
  waveColor?: 'white' | 'slate' | 'purple' | 'gradient'
}) {
  const bgClasses = {
    default: 'bg-white dark:bg-slate-900',
    gradient: 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800',
    dark: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    light: 'bg-slate-50 dark:bg-slate-800',
    mesh: '',
  }

  return (
    <section className={`relative overflow-hidden ${bgClasses[background]} ${className}`}>
      {background === 'mesh' && <MeshGradient />}
      {withOrbs && <GradientOrbs variant={background === 'dark' ? 'hero' : 'default'} />}
      {withDots && <DotGridPattern />}
      {withFloatingIcons && <FloatingTechIcons variant={background === 'dark' ? 'light' : 'default'} />}
      {withCircuit && <CircuitPattern variant={background === 'dark' ? 'light' : 'default'} />}
      {withParticles && <FloatingParticles color={background === 'dark' ? 'white' : 'default'} />}
      {withWaveTop && <WaveDivider position="top" color={waveColor} />}
      <div className="relative z-10">
        {children}
      </div>
      {withWaveBottom && <WaveDivider position="bottom" color={waveColor} />}
    </section>
  )
}
