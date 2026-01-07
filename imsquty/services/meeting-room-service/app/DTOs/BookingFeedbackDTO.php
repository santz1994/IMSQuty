<?php

namespace App\DTOs;

class BookingFeedbackDTO
{
    public function __construct(
        public readonly string $booking_id,
        public readonly int $user_id,
        public readonly int $rating, // 1-5 stars
        public readonly ?string $cleanliness_rating = null, // Poor, Fair, Good, Excellent
        public readonly ?string $equipment_rating = null, // Poor, Fair, Good, Excellent
        public readonly ?string $comment = null,
        public readonly ?bool $would_recommend = true,
        public readonly ?array $issues = null,
    ) {}

    public static function fromRequest(array $data, string $bookingId): self
    {
        return new self(
            booking_id: $bookingId,
            user_id: (int) ($data['user_id'] ?? auth()->id()),
            rating: (int) $data['rating'],
            cleanliness_rating: $data['cleanliness_rating'] ?? null,
            equipment_rating: $data['equipment_rating'] ?? null,
            comment: $data['comment'] ?? null,
            would_recommend: (bool) ($data['would_recommend'] ?? true),
            issues: $data['issues'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'booking_id' => $this->booking_id,
            'user_id' => $this->user_id,
            'rating' => $this->rating,
            'cleanliness_rating' => $this->cleanliness_rating,
            'equipment_rating' => $this->equipment_rating,
            'comment' => $this->comment,
            'would_recommend' => $this->would_recommend,
            'issues' => $this->issues ? json_encode($this->issues) : null,
        ];
    }

    public function isValidRating(): bool
    {
        return $this->rating >= 1 && $this->rating <= 5;
    }

    public function isPositiveFeedback(): bool
    {
        return $this->rating >= 4;
    }
}
