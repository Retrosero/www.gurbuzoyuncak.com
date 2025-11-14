import { useState, useEffect } from 'react'
import { ProductReview, ReviewFilter } from '@/types'
import { Star, ThumbsUp, ThumbsDown, Camera, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ProductReviewsProps {
  productId: number
  averageRating: number
  reviewCount: number
  onReviewAdded?: () => void
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  verifiedReviews: number
  reviewsWithImages: number
}

export default function ProductReviews({ 
  productId, 
  averageRating, 
  reviewCount,
  onReviewAdded 
}: ProductReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [filter, setFilter] = useState<ReviewFilter>({
    sortBy: 'newest'
  })
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  })

  useEffect(() => {
    loadReviews()
    loadStats()
  }, [productId])

  useEffect(() => {
    applyFilter()
  }, [reviews, filter])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user:profiles!product_reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating, is_verified_purchase, images')
        .eq('product_id', productId)
        .eq('status', 'approved')

      if (error) throw error

      const reviews = data || []
      const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let totalRating = 0
      let verifiedCount = 0
      let withImagesCount = 0

      reviews.forEach(review => {
        ratingDistribution[review.rating]++
        totalRating += review.rating
        if (review.is_verified_purchase) verifiedCount++
        if (review.images && review.images.length > 0) withImagesCount++
      })

      setStats({
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
        ratingDistribution,
        verifiedReviews: verifiedCount,
        reviewsWithImages: withImagesCount
      })
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
    }
  }

  const applyFilter = () => {
    let filtered = [...reviews]

    // Rating filtresi
    if (filter.rating) {
      filtered = filtered.filter(review => review.rating === filter.rating)
    }

    // Sadece resimli yorumlar
    if (filter.hasImages) {
      filtered = filtered.filter(review => 
        review.images && review.images.length > 0
      )
    }

    // Sadece doğrulanmış satın alımlar
    if (filter.verifiedOnly) {
      filtered = filtered.filter(review => review.is_verified_purchase)
    }

    // Sıralama
    switch (filter.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'highest_rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest_rating':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'most_helpful':
        filtered.sort((a, b) => b.helpful_count - a.helpful_count)
        break
    }

    setFilteredReviews(filtered)
  }

  const handleReviewVote = async (reviewId: number, voteType: 'helpful' | 'not_helpful') => {
    if (!user) {
      alert('Oy vermek için giriş yapmalısınız')
      return
    }

    try {
      // Önce mevcut oyunu kontrol et
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingVote) {
        // Mevcut oyu güncelle veya sil
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          await supabase
            .from('review_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else {
        // Yeni oy ekle
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            vote_type: voteType
          })
      }

      // Yorumları yenile
      loadReviews()
    } catch (error) {
      console.error('Oy verme hatası:', error)
    }
  }

  const handleAddReview = async () => {
    if (!user) {
      alert('Yorum yapmak için giriş yapmalısınız')
      return
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      alert('Lütfen başlık ve yorum giriniz')
      return
    }

    try {
      await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          images: newReview.images,
          is_verified_purchase: true, // Gerçek implementasyonda sipariş kontrolü yapılacak
          status: 'approved' // Gerçek implementasyonda 'pending' olacak
        })

      setShowAddReview(false)
      setNewReview({ rating: 5, title: '', comment: '', images: [] })
      loadReviews()
      loadStats()
      onReviewAdded?.()
    } catch (error) {
      console.error('Yorum ekleme hatası:', error)
    }
  }

  const renderStars = (rating: number, size = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* İstatistikler */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating), 'lg')}
              <div className="text-sm text-gray-600 mt-2">
                {stats.totalReviews} değerlendirme
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.totalReviews > 0 
                          ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 
                          : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {stats.ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4" />
              <span>{stats.verifiedReviews} doğrulanmış satın alma</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Camera className="w-4 h-4" />
              <span>{stats.reviewsWithImages} resimli yorum</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtreler ve Sıralama */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.rating?.toString() || 'all'}
            onValueChange={(value) => 
              setFilter(prev => ({
                ...prev,
                rating: value === 'all' ? undefined : parseInt(value)
              }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Puan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Puanlar</SelectItem>
              <SelectItem value="5">5 Yıldız</SelectItem>
              <SelectItem value="4">4 Yıldız</SelectItem>
              <SelectItem value="3">3 Yıldız</SelectItem>
              <SelectItem value="2">2 Yıldız</SelectItem>
              <SelectItem value="1">1 Yıldız</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="hasImages"
              checked={filter.hasImages || false}
              onCheckedChange={(checked) =>
                setFilter(prev => ({ ...prev, hasImages: checked as boolean }))
              }
            />
            <label htmlFor="hasImages" className="text-sm">Resimli</label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="verifiedOnly"
              checked={filter.verifiedOnly || false}
              onCheckedChange={(checked) =>
                setFilter(prev => ({ ...prev, verifiedOnly: checked as boolean }))
              }
            />
            <label htmlFor="verifiedOnly" className="text-sm">Doğrulanmış</label>
          </div>
        </div>

        <Select
          value={filter.sortBy}
          onValueChange={(value: any) => 
            setFilter(prev => ({ ...prev, sortBy: value }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">En Yeni</SelectItem>
            <SelectItem value="oldest">En Eski</SelectItem>
            <SelectItem value="highest_rating">En Yüksek Puan</SelectItem>
            <SelectItem value="lowest_rating">En Düşük Puan</SelectItem>
            <SelectItem value="most_helpful">En Faydalı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Yorum Ekleme Butonu */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddReview(true)}>
          <Star className="w-4 h-4 mr-2" />
          Yorum Yap
        </Button>
      </div>

      {/* Yorumlar Listesi */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Henüz yorum bulunmuyor</p>
            <p className="text-sm">İlk yorumu siz yapın!</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.user?.avatar_url ? (
                      <img 
                        src={review.user.avatar_url} 
                        alt={review.user.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {review.user?.full_name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{review.user?.full_name || 'Anonim'}</div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.created_at), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {review.is_verified_purchase && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Doğrulanmış Satın Alma
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Yorum Resimleri */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Yorum resmi ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              )}

              {/* Faydalı Olma Butonları */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  onClick={() => handleReviewVote(review.id, 'helpful')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Faydalı ({review.helpful_count})
                </button>
                <button
                  onClick={() => handleReviewVote(review.id, 'not_helpful')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Faydasız ({review.not_helpful_count})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yorum Ekleme Modal (basit implementasyon) */}
      {showAddReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Yorum Yap</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Puanınız</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Başlık</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Yorumunuzun başlığı"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Yorumunuz</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
                  placeholder="Ürün hakkında düşüncelerinizi paylaşın"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAddReview(false)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                onClick={handleAddReview}
                className="flex-1"
              >
                Yayınla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}