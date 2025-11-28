'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ratingsApi } from '@/lib/api';

interface RatingProps {
  postId: string;
}

export default function Rating({ postId }: RatingProps) {
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [postId, user]);

  const fetchRatings = async () => {
    try {
      const data = await ratingsApi.getByPostId(postId);

      if (data) {
        setAverageRating(data.averageRating || 0);
        setTotalRatings(data.totalRatings || 0);

        // Check if current user has rated
        if (user && data.ratings) {
          const userRatingData = data.ratings.find((r: any) => r.user_id === user.id);
          if (userRatingData) {
            setUserRating(userRatingData.rating);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
    setLoading(false);
  };

  const handleRate = async (rating: number) => {
    if (!user) return;
    if (submitting) return;

    setSubmitting(true);

    try {
      await ratingsApi.upsert(postId, { user_id: user.id, rating });
      setUserRating(rating);
      fetchRatings();
    } catch (err) {
      console.error('Error saving rating:', err);
    }
    setSubmitting(false);
  };

  const renderStar = (index: number) => {
    const filled = hoveredRating > 0 ? index <= hoveredRating : index <= (userRating || averageRating);

    return (
      <button
        key={index}
        type="button"
        onClick={() => user && handleRate(index)}
        onMouseEnter={() => user && setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        disabled={!user || submitting}
        className={`text-xl sm:text-2xl transition-all ${
          user ? 'cursor-pointer hover:scale-110' : 'cursor-default'
        } ${submitting ? 'opacity-50' : ''}`}
      >
        {filled ? '⭐' : '☆'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 sm:h-8 w-24 sm:w-32 glass rounded-xl shimmer"></div>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover-float">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">Rate this article</h4>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5].map((i) => renderStar(i))}
          </div>
          {!user && (
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
              <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">Sign in</a> to rate
            </p>
          )}
          {userRating > 0 && (
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
              ✓ You rated this {userRating} star{userRating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="text-left sm:text-center sm:text-right">
          <div className="text-2xl sm:text-3xl font-bold gradient-text">
            {averageRating.toFixed(1)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
