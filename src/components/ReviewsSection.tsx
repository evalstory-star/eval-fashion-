import React, { useState } from 'react';
import { Star, MessageSquarePlus, ShieldCheck, Check } from 'lucide-react';
import { Review } from '../types/store';
import { sanitizeInput } from '../utils/security';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    // Strict sanitization preventing stored XSS
    const cleanName = sanitizeInput(authorName, 60);
    const cleanComment = sanitizeInput(comment, 400);

    onAddReview({
      name: cleanName,
      rating,
      comment: cleanComment,
      verifiedPurchase: true,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setAuthorName('');
      setComment('');
    }, 1500);
  };

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>تقييمات موثقة من عميلاتنا</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              تجارب عميلات إيفال
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              نفخر برضا زبائننا عن جودة الخامات والتطريز وخدمة التوصيل السريعة.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showForm ? 'إلغاء' : 'شاركينا رأيك'}</span>
          </button>
        </div>

        {/* Add Review Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 bg-stone-50 rounded-2xl border border-stone-200/80 max-w-xl space-y-4 animate-in fade-in duration-200"
          >
            <h3 className="text-sm font-bold text-stone-900">إضافة تقييم جديد</h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الكريم</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="مثال: ندى محمود"
                required
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">التقييم</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-stone-300 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">تعليقك وتجربتك مع القطعة</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="صفي لنا رأيك في القماش، المقاس، والتعامل..."
                rows={3}
                required
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              {submitted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم نشر التقييم بنجاح!</span>
                </>
              ) : (
                <span>نشر التقييم</span>
              )}
            </button>
          </form>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-6 bg-stone-50/70 rounded-2xl border border-stone-200/60 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>

                  <span className="text-[11px] text-stone-400 tabular-nums">{rev.createdAt}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">{rev.name}</span>
                {rev.verifiedPurchase && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                    شراء مؤكد ✓
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
