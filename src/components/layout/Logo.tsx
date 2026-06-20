type LogoProps = {
  className?: string;
};

// Horizontal placeholder logo ("پرفسور پرفیوم"). Swap the mark/text later for the real brand asset.
export default function Logo({ className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-700 to-[#8b1e55] font-serif text-lg text-white shadow-sm">
        پ
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-base font-semibold text-violet-900">پرفسور پرفیوم</span>
        <span className="text-[10px] tracking-[0.28em] text-violet-500">PROFESSOR PERFUME</span>
      </span>
    </span>
  );
}
