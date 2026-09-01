'use client';

import { useEffect, useState } from 'react';
import type { BannerDTO } from '@turfhood/shared';

export function BannerCarousel({ banners }: { banners: BannerDTO[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % banners.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length]);
  if (!banners.length)
    return (
      <section className="flex min-h-72 items-center rounded-2xl bg-gradient-to-r from-green-950 to-green-700 p-8 text-white sm:p-12">
        <div>
          <h1 className="text-3xl font-bold sm:text-5xl">Find your next game</h1>
          <p className="mt-3 max-w-xl text-green-100">Discover and book quality turfs near you.</p>
        </div>
      </section>
    );
  const safeActive = active % banners.length;
  const banner = banners[safeActive]!;
  return (
    <section className="relative min-h-72 overflow-hidden rounded-2xl bg-black text-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote admin-managed Cloudinary URL */}
      <img
        src={banner.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="relative z-10 flex min-h-72 items-center p-8 sm:p-12">
        <div>
          <h1 className="text-3xl font-bold sm:text-5xl">{banner.title}</h1>
          <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">{banner.description}</p>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
        {banners.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show banner ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full ${index === safeActive ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
