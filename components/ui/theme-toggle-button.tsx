'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import designSystem from '@/university_design_system.json';

const DS = designSystem.designSystem;

interface ThemeToggleButtonProps {
    className?: string;
    variant?: 'primary' | 'secondary' | 'filter';
    size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
    className,
    variant = 'secondary',
    size = 'md'
}) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before checking theme
    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.classList.contains('dark');
        setIsDarkMode(currentTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);

        if (newTheme) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    // Size configurations following design system
    const sizeConfig = {
        sm: {
            width: '32px',
            height: '32px',
            iconSize: DS.iconography.sizes.sm,
            fontSize: DS.typography.fontSizes.xs,
        },
        md: {
            width: '40px',
            height: '40px',
            iconSize: DS.iconography.sizes.md,
            fontSize: DS.typography.fontSizes.sm,
        },
        lg: {
            width: '48px',
            height: '48px',
            iconSize: DS.iconography.sizes.lg,
            fontSize: DS.typography.fontSizes.base,
        },
    };

    // Button variant styles following design system
    const getButtonStyles = () => {
        const baseStyles = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: DS.components.buttons.primary.borderRadius,
            border: DS.components.buttons.primary.border,
            cursor: DS.components.buttons.primary.cursor,
            transition: DS.interactions.transitions.default,
            fontFamily: DS.typography.fontFamily.primary,
            fontWeight: DS.typography.fontWeights[DS.components.buttons.primary.fontWeight as keyof typeof DS.typography.fontWeights],
            fontSize: sizeConfig[size].fontSize,
            width: sizeConfig[size].width,
            height: sizeConfig[size].height,
            position: 'relative' as const,
            overflow: 'hidden' as const,
        };

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyles,
                    backgroundColor: DS.colorPalette.primary.brand,
                    color: DS.colorPalette.neutral.white,
                };
            case 'secondary':
                return {
                    ...baseStyles,
                    backgroundColor: `hsl(var(--secondary))`,
                    color: `hsl(var(--secondary-foreground))`,
                    border: `1px solid hsl(var(--border))`,
                };
            case 'filter':
                return {
                    ...baseStyles,
                    backgroundColor: `hsl(var(--background))`,
                    color: DS.colorPalette.primary.brand,
                    border: `1px solid ${DS.colorPalette.primary.brand}`,
                    padding: DS.components.buttons.filter.padding,
                };
            default:
                return baseStyles;
        }
    };

    const buttonStyles = getButtonStyles();

    // Hover and focus styles following design system
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = DS.colorPalette.primary.brandDark;
            e.currentTarget.style.transform = DS.interactions.hover.lift;
            e.currentTarget.style.boxShadow = DS.interactions.hover.shadow;
        } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = `hsl(var(--accent))`;
            e.currentTarget.style.transform = DS.interactions.hover.lift;
        } else if (variant === 'filter') {
            e.currentTarget.style.backgroundColor = `hsl(var(--accent))`;
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = DS.colorPalette.primary.brand;
        } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = `hsl(var(--secondary))`;
        } else if (variant === 'filter') {
            e.currentTarget.style.backgroundColor = `hsl(var(--background))`;
        }
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
    };

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
        e.currentTarget.style.outline = DS.interactions.focus.outline;
        e.currentTarget.style.outlineOffset = DS.interactions.focus.outlineOffset;
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
        e.currentTarget.style.outline = 'none';
    };

    return (
        <button
            onClick={toggleTheme}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn("relative overflow-hidden", className)}
            style={buttonStyles}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Icon with smooth transition */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: DS.interactions.transitions.default,
                    transform: isDarkMode ? 'rotate(0deg)' : 'rotate(180deg)',
                }}
            >
                {isDarkMode ? (
                    <Sun
                        style={{
                            width: sizeConfig[size].iconSize,
                            height: sizeConfig[size].iconSize,
                            transition: DS.interactions.transitions.default,
                        }}
                    />
                ) : (
                    <Moon
                        style={{
                            width: sizeConfig[size].iconSize,
                            height: sizeConfig[size].iconSize,
                            transition: DS.interactions.transitions.default,
                        }}
                    />
                )}
            </div>

            {/* Ripple effect on click */}
            <div
                className="absolute inset-0 opacity-0 bg-white/20 rounded-full scale-0 transition-all duration-300"
                style={{
                    animation: 'none',
                }}
            />
        </button>
    );
};

export default ThemeToggleButton; 