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
        className={`text-2xl transition-all ${
          user ? 'cursor-pointer hover:scale-110' : 'cursor-default'
        } ${submitting ? 'opacity-50' : ''}`}
      >
        {filled ? '⭐' : '☆'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Rate this article</h4>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => renderStar(i))}
          </div>
          {!user && (
            <p className="text-sm text-gray-400 mt-1">
              <a href="/login" className="text-indigo-600 hover:underline">Sign in</a> to rate
            </p>
          )}
          {userRating > 0 && (
            <p className="text-sm text-green-600 mt-1">
              ✓ You rated this {userRating} star{userRating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="text-center sm:text-right">
          <div className="text-3xl font-bold text-indigo-600">
            {averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">
            {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
