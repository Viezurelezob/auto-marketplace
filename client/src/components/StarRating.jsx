const SIZES = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

export default function StarRating({ value = 0, onChange, size = 'md' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={[
            SIZES[size],
            star <= Math.round(value) ? 'text-amber-400' : 'text-gray-200',
            onChange ? 'hover:text-amber-300 cursor-pointer' : 'cursor-default',
            'transition-colors leading-none',
          ].join(' ')}
        >
          ★
        </button>
      ))}
    </div>
  );
}
