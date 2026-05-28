export default function AboutPage() {
  return (
    <div className="min-h-screen bg-violet-50">
      <div className="mx-auto max-w-6xl p-8">
        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm uppercase text-violet-600">Online store</p>
            <h1 className="mb-4 text-4xl font-bold text-violet-900">Professor Perfume</h1>
            <p className="mb-4 text-gray-700">
              We curate premium fragrances for diverse styles and moods. We focus on quality, clean packaging,
              and fast support.
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <div className="font-semibold">Phone</div>
                <a className="text-violet-700" href="tel:+989123456789">
                  +98 912 345 6789
                </a>
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <a className="text-violet-700" href="mailto:info@professor-perfume.ir">
                  info@professor-perfume.ir
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=800&q=80"
              alt="Perfume showcase"
              className="w-full max-w-md rounded-lg object-cover shadow-lg"
            />
          </div>
        </section>

        <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-violet-900">Why choose us</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Curated and authentic collection</li>
            <li>Simple replacement flow for defective items</li>
            <li>Fast and friendly support</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
