"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { productImageUrl } from "@/lib/products/image-url";
import { ProductImage } from "@/components/shared/product-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type GalleryImage = { path: string; position: number };

export function ProductGallery({
  images,
  name,
  conditionLabel,
}: {
  images: GalleryImage[];
  name: string;
  conditionLabel: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // Produto sem foto — mantém o fallback da inicial do nome.
  if (images.length === 0) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/40">
        <ProductImage
          path={null}
          alt={name}
          name={name}
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          fallbackClassName="text-6xl"
        />
        <span className="absolute top-4 left-4 bg-background/90 text-secondary-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
          {conditionLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Carousel setApi={setApi} opts={{ loop: images.length > 1 }}>
        <div className="relative">
          <CarouselContent className="-ml-0">
            {images.map((img, i) => (
              <CarouselItem key={img.path} className="pl-0">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/40">
                  <Image
                    src={productImageUrl(img.path)}
                    alt={`${name} — imagem ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <span className="pointer-events-none absolute top-4 left-4 z-10 bg-background/90 text-secondary-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
            {conditionLabel}
          </span>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 size-9 border-border/60 bg-background/80 text-secondary-foreground hover:bg-background backdrop-blur-sm" />
              <CarouselNext className="right-4 size-9 border-border/60 bg-background/80 text-secondary-foreground hover:bg-background backdrop-blur-sm" />
            </>
          )}
        </div>
      </Carousel>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.path}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={current === i}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-secondary/40 ring-1 ring-border transition-all duration-200",
                current === i
                  ? "ring-2 ring-primary"
                  : "opacity-90 hover:opacity-100 hover:ring-secondary-light/60",
              )}
            >
              <Image
                src={productImageUrl(img.path)}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
