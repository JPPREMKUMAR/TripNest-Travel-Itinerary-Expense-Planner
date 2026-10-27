import React, { useState } from 'react';
import { ImageOff, Mountain } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Trip visual',
  fallbackTitle,
  fallbackSubtitle,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = !src || hasError;

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${containerClassName}`}>
      {/* Fallback container */}
      {showFallback ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100 text-stone-600 text-center select-none">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2 text-orange-600">
            {fallbackTitle ? <Mountain className="w-6 h-6 stroke-[1.75]" /> : <ImageOff className="w-6 h-6 stroke-[1.75]" />}
          </div>
          {fallbackTitle && (
            <p className="text-sm font-semibold text-stone-800 line-clamp-1">
              {fallbackTitle}
            </p>
          )}
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
            {fallbackSubtitle || 'Scenic Destination'}
          </p>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
              <Mountain className="w-6 h-6 text-stone-400" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            onLoad={() => setIsLoading(false)}
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            referrerPolicy="no-referrer"
            {...props}
          />
        </>
      )}
    </div>
  );
};
