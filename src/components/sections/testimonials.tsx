"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { SectionHeader } from "@/components/shared/section-header";
import { testimonials } from "@/lib/data/testimonials";

import "swiper/css";
import "swiper/css/pagination";

export function TestimonialsSection() {
  return (
    <section className="section-padding section-alt" aria-labelledby="testimonials-heading">
      <div className="container-custom">
        <SectionHeader
          label="Success Stories"
          title="What Our Students Say"
          description="Hear from graduates who transformed their careers through EEST programs."
        />

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 2 },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-background p-6 lg:p-8 h-full flex flex-col shadow-sm"
              >
                {testimonial.type === "video" && testimonial.videoUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                    <iframe
                      src={testimonial.videoUrl}
                      title={`${testimonial.name} testimonial`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <Quote className="w-8 h-8 text-primary/40 mb-4" aria-hidden="true" />
                )}

                <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <blockquote className="text-muted leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.program}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
