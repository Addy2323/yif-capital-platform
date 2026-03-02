export function HeroSection() {
  return (
    <section
      className="relative py-1.5 lg:py-2 flex-none hidden sm:flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/logo%20payment/background/hero1.png')" }}
    >
      <div className="absolute inset-0 bg-navy/70 z-0" />
      <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center relative z-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
          Empowering Your Financial{" "}
          <br className="hidden sm:block" />
          Future with{" "}
          <span className="text-gold">YIF Capital</span>
        </h1>
      </div>
    </section>
  )
}
