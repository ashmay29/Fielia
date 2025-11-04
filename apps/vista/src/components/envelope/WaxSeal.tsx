export function WaxSeal() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="relative h-24 w-24 sm:h-28 sm:w-28">
        {/* Outer shadow for depth */}
        <div className="absolute inset-0 rounded-full bg-[#0A0A08] opacity-40 blur-xl" />
        
        {/* Main seal body - dark red-brown */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#671C1C] via-[#501515] to-[#2E0506] shadow-[0_4px_20px_rgba(0,0,0,0.7),inset_0_-2px_6px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(103,28,28,0.3)]" />
        
        {/* Subtle gloss on top edge */}
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)"
          }}
        />
        
        {/* Outer engraved ring - parchment/gold */}
        <div className="absolute inset-[14px] rounded-full border-[1.5px] border-[#D8CBBB] opacity-70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
        
        {/* Inner engraved ring */}
        <div className="absolute inset-[18px] rounded-full border border-[#E1D6C7] opacity-60 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
        
        {/* Center depression for emblem */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#370D10] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] sm:h-12 sm:w-12">
          {/* Engraved F - parchment/gold with depth */}
          <div 
            className="flex items-center justify-center font-[family-name:var(--font-great-vibes)] text-2xl text-[#D8CBBB] sm:text-3xl" 
            style={{ 
              textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 -1px 0 rgba(225,214,199,0.2), 0 0 6px rgba(225,214,199,0.3)',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
            }}
          >
            F
          </div>
        </div>
        
        {/* Bottom shadow for 3D lift */}
        <div className="absolute inset-x-1 bottom-0 h-1 rounded-full bg-[#0A0A08] opacity-60 blur-sm" />
      </div>
    </div>
  );
}
