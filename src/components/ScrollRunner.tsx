/**
 * A thin orange track along the top of the viewport that fills as you scroll,
 * with the logo's striding runner at its tip. Pure CSS (scroll-driven
 * animations); hidden where unsupported or when reduced motion is preferred.
 */
export function ScrollRunner() {
  return (
    <div aria-hidden="true" className="scroll-track pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="scroll-track-fill absolute inset-0 origin-left bg-orange" />
      <span
        className="scroll-track-runner absolute -top-[14px] block h-[16px] w-[17px]"
        style={{
          backgroundImage: "url(/img/logo-wordmark.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 26px",
          backgroundPosition: "-36px -5px",
        }}
      />
    </div>
  );
}
