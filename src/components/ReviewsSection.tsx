import React from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';

interface ReviewsSectionProps {
  isDarkMode: boolean;
}

const REVIEWS = [
  {
    id: 1,
    name: 'Derrick K.',
    tag: 'Verified Repair Customer',
    device: 'iPhone 12 Pro Max',
    text: 'Fixed my iPhone 12 Pro Max screen in under 45 minutes at Pioneer Mall. The OLED (DD) screen quality is identical to the original. High precision work!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sandra M.',
    tag: 'Verified Customer',
    device: 'iPhone 13',
    text: 'Thought my iPhone 13 was dead from water damage. They performed micro-soldering on the board and saved all my data. Super transparent pricing!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Joel T.',
    tag: 'Technician / Wholesale Buyer',
    device: 'Shop Owner / Tech',
    text: 'I buy all my original batteries and replacement screens for my shop from iPhone Lab. Reliable quality every time and great customer service.',
    rating: 5,
  },
];

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ isDarkMode }) => {
  return (
    <section id="reviews" className={`py-20 relative overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-50'
    }`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] bg-[#1D9BB5] rounded-full blur-[130px] opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className={`text-3xl sm:text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
            What Our Clients Say
          </h2>
          <p className="text-base text-slate-400">
            Real feedback from iPhone owners and technicians in Kampala.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`p-6 sm:p-7 rounded-3xl relative flex flex-col justify-between transition-all duration-300 shadow-xl ${
                isDarkMode ? 'glass-card-dark hover:border-[#1D9BB5]/50' : 'glass-card-light hover:border-[#1D9BB5]'
              }`}
            >
              <div>
                {/* 5 Gold Stars */}
                <div
                  className="flex items-center gap-1 mb-4"
                  aria-label={`${review.rating} out of 5 stars`}
                  role="img"
                >
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" aria-hidden="true" />
                  ))}
                </div>

                {/* Review Text */}
                <p className={`text-sm sm:text-base leading-relaxed mb-6 italic ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  &quot;{review.text}&quot;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-[#1F3864]'}`}>
                    {review.name}
                  </div>
                  <div className="text-[#1D9BB5] font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{review.tag}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400">
                    {review.device}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Leave Review CTA */}
        <div className="text-center">
          <a
            href="https://www.google.com/maps/search/Pioneer+Mall+Kampala+iPhone+Lab+UG"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glow-btn text-white font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Leave a Review on Google</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
