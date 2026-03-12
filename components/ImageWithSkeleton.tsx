import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ src, alt, className, containerClassName = "", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${containerClassName} ${className?.includes('rounded') ? '' : 'rounded-none'}`}>
      {/* Skeleton / Loading State */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <ImageIcon className="text-gray-300 opacity-50" size={24} />
        </div>
      )}
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />

      {/* Error State */}
      {error && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 text-xs p-2 text-center z-20">
              <ImageIcon size={20} className="mb-1 opacity-50" />
              <span>Failed</span>
          </div>
      )}
    </div>
  );
};
