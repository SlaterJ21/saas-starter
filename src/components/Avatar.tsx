'use client';
import Image from 'next/image';
import { useState } from 'react';

type Props = {
    name: string;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
};

export default function Avatar({ name, imageUrl, size = 'md' }: Props) {
    const [imageError, setImageError] = useState(false);

    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-16 h-16 text-xl',
        lg: 'w-24 h-24 text-3xl',
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (imageUrl && !imageError) {
        return (
            <Image
                src={imageUrl}
                alt={name}
                width={80}
                height={80}
                className={`${sizes[size]} rounded-full object-cover`}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className={`${sizes[size]} rounded-full ${getColorFromName(name)} flex items-center justify-center text-white font-bold`}>
            {getInitials(name)}
        </div>
    );
}