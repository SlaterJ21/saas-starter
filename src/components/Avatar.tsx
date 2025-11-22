'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AvatarProps {
    name: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl',
    };

    const getInitials = () => {
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getColorFromName = (name: string) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-red-500',
            'bg-yellow-500',
            'bg-teal-500',
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    if (!imageUrl || imageError) {
        return (
            <div
                className={`${sizes[size]} ${getColorFromName(name)} rounded-full flex items-center justify-center text-white font-bold`}
            >
                {getInitials()}
            </div>
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            width={80}
            height={80}
            className={`${sizes[size]} rounded-full object-cover`}
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
    );
}