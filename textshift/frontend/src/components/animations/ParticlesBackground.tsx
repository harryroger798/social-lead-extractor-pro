export default function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
      <div className="absolute w-1 h-1 bg-emerald-500/30 rounded-full top-[10%] left-[20%] animate-float-slow" />
      <div className="absolute w-1.5 h-1.5 bg-emerald-500/20 rounded-full top-[30%] left-[70%] animate-float-medium" />
      <div className="absolute w-1 h-1 bg-emerald-500/25 rounded-full top-[60%] left-[40%] animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute w-0.5 h-0.5 bg-emerald-500/30 rounded-full top-[80%] left-[80%] animate-float-medium" style={{ animationDelay: '1s' }} />
      <div className="absolute w-1 h-1 bg-emerald-500/20 rounded-full top-[45%] left-[10%] animate-float-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute w-1.5 h-1.5 bg-emerald-500/15 rounded-full top-[15%] left-[50%] animate-float-medium" style={{ animationDelay: '4s' }} />
    </div>
  );
}
