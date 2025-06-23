'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import designSystem from '@/university_design_system.json';

// Types based on design system
interface UniversityPortalLayoutProps {
    children: ReactNode;
    variant?: 'dashboard' | 'dataTable' | 'default';
    showSidebar?: boolean;
    sidebarContent?: ReactNode;
    headerContent?: ReactNode;
    className?: string;
}

interface NavigationItem {
    id: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
}

interface SidebarSection {
    label?: string;
    items: NavigationItem[];
}

// Design system constants extracted from JSON
const DS = designSystem.designSystem;

// CSS-in-JS style generator for design system values
const createStyles = () => {
    const styles = {
        // Layout structure styles
        sidebar: {
            width: DS.layout.structure.sidebar.width,
            backgroundColor: `hsl(var(--sidebar-background))`, // Use existing dark mode variable
            position: 'fixed' as const,
            height: DS.layout.structure.sidebar.height,
            overflowY: 'auto' as const,
            zIndex: 20,
            transition: DS.interactions.transitions.default,
        },
        header: {
            height: DS.layout.structure.header.height,
            backgroundColor: `hsl(var(--card))`, // Use existing dark mode variable
            borderBottom: `1px solid hsl(var(--border))`, // Use existing dark mode variable
            position: 'sticky' as const,
            top: 0,
            zIndex: 10,
            transition: DS.interactions.transitions.default,
        },
        mainContent: {
            marginLeft: DS.layout.structure.mainContent.marginLeft,
            minHeight: DS.layout.structure.mainContent.minHeight,
            backgroundColor: `hsl(var(--background))`, // Use existing dark mode variable
            padding: DS.layout.structure.mainContent.padding,
            transition: DS.interactions.transitions.default,
        },
        // Navigation styles
        navigationItem: {
            height: DS.layout.sidebar.navigation.itemHeight,
            padding: DS.layout.sidebar.navigation.itemPadding,
            fontSize: DS.typography.fontSizes.sm,
            color: `hsl(var(--sidebar-foreground))`, // Use existing dark mode variable
            transition: DS.interactions.transitions.default,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '8px',
            margin: '4px 8px',
        },
        navigationItemHover: {
            backgroundColor: `hsl(var(--sidebar-accent))`, // Use existing dark mode variable
        },
        navigationItemActive: {
            backgroundColor: DS.colorPalette.primary.brand,
            color: DS.colorPalette.neutral.white,
        },
        // Component styles
        card: {
            ...DS.components.cards.default,
            backgroundColor: `hsl(var(--card))`, // Use existing dark mode variable
            border: `1px solid hsl(var(--border))`, // Use existing dark mode variable
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)', // Darker shadow for dark mode
        },
        cardElevated: {
            ...DS.components.cards.elevated,
            backgroundColor: `hsl(var(--card))`, // Use existing dark mode variable
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // Darker shadow for dark mode
        },
        button: {
            primary: {
                ...DS.components.buttons.primary,
                fontSize: DS.typography.fontSizes.sm,
                fontWeight: DS.typography.fontWeights.medium,
            },
            secondary: {
                ...DS.components.buttons.secondary,
                backgroundColor: `hsl(var(--secondary))`, // Use existing dark mode variable
                color: `hsl(var(--secondary-foreground))`, // Use existing dark mode variable
                border: `1px solid hsl(var(--border))`, // Use existing dark mode variable
                fontSize: DS.typography.fontSizes.sm,
                fontWeight: DS.typography.fontWeights.medium,
            },
            filter: {
                ...DS.components.buttons.filter,
                fontSize: DS.typography.fontSizes.sm,
                fontWeight: DS.typography.fontWeights.medium,
            },
        },
        // Typography styles
        typography: {
            fontFamily: DS.typography.fontFamily.primary,
            fontSize: {
                xs: DS.typography.fontSizes.xs,
                sm: DS.typography.fontSizes.sm,
                base: DS.typography.fontSizes.base,
                lg: DS.typography.fontSizes.lg,
                xl: DS.typography.fontSizes.xl,
                '2xl': DS.typography.fontSizes['2xl'],
                '3xl': DS.typography.fontSizes['3xl'],
                '4xl': DS.typography.fontSizes['4xl'],
            },
            fontWeight: {
                normal: DS.typography.fontWeights.normal,
                medium: DS.typography.fontWeights.medium,
                semibold: DS.typography.fontWeights.semibold,
                bold: DS.typography.fontWeights.bold,
            },
            lineHeight: {
                tight: DS.typography.lineHeights.tight,
                normal: DS.typography.lineHeights.normal,
                relaxed: DS.typography.lineHeights.relaxed,
            },
        },
    };
    return styles;
};

// Sidebar Navigation Component
interface SidebarNavigationProps {
    sections: SidebarSection[];
    className?: string;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ sections, className }) => {
    const styles = createStyles();

    return (
        <nav className={cn("p-4", className)}>
            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                    {section.label && (
                        <h3
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3"
                            style={{
                                fontSize: styles.typography.fontSize.xs,
                                fontWeight: styles.typography.fontWeight.semibold,
                            }}
                        >
                            {section.label}
                        </h3>
                    )}
                    <ul className="space-y-1">
                        {section.items.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={item.onClick}
                                    className={cn(
                                        "w-full text-left rounded-lg transition-colors",
                                        item.active
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    style={{
                                        ...styles.navigationItem,
                                        ...(item.active ? styles.navigationItemActive : {}),
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!item.active) {
                                            Object.assign(e.currentTarget.style, styles.navigationItemHover);
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!item.active) {
                                            Object.assign(e.currentTarget.style, {
                                                backgroundColor: 'transparent',
                                            });
                                        }
                                    }}
                                >
                                    {item.icon && (
                                        <span
                                            className="flex-shrink-0"
                                            style={{
                                                width: DS.layout.sidebar.navigation.iconSize,
                                                height: DS.layout.sidebar.navigation.iconSize,
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="truncate">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
};

// Header Component
interface HeaderProps {
    children?: ReactNode;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
    const styles = createStyles();

    return (
        <header
            className={cn("flex items-center justify-between px-6", className)}
            style={styles.header}
        >
            {children}
        </header>
    );
};

// Card Component following design system
interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'profile';
    className?: string;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className, style }) => {
    const styles = createStyles();

    const cardStyle = variant === 'elevated' ? styles.cardElevated : styles.card;

    return (
        <div
            className={cn("rounded-lg", className)}
            style={{ ...cardStyle, ...style }}
        >
            {children}
        </div>
    );
};

// Button Component following design system
interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'filter';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className,
    onClick,
    disabled,
    type = 'button'
}) => {
    const styles = createStyles();

    const buttonStyle = styles.button[variant] || styles.button.primary;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn("inline-flex items-center justify-center transition-colors", className)}
            style={buttonStyle}
            onMouseEnter={(e) => {
                if (!disabled && variant === 'primary') {
                    e.currentTarget.style.backgroundColor = DS.colorPalette.primary.brandDark;
                } else if (!disabled && variant === 'secondary') {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
                }
            }}
        >
            {children}
        </button>
    );
};

// Table Component following design system
interface TableProps {
    children: ReactNode;
    className?: string;
}

const Table: React.FC<TableProps> = ({ children, className }) => {
    const styles = createStyles();

    return (
        <div
            className={cn("overflow-hidden", className)}
            style={DS.components.tables.container}
        >
            <table className="w-full">
                {children}
            </table>
        </div>
    );
};

// Main Layout Component
export const UniversityPortalLayout: React.FC<UniversityPortalLayoutProps> = ({
    children,
    variant = 'default',
    showSidebar = true,
    sidebarContent,
    headerContent,
    className,
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const styles = createStyles();

    // Responsive handling
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < parseInt(DS.responsive.breakpoints.md);
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Layout pattern styles based on variant
    const getLayoutStyles = () => {
        switch (variant) {
            case 'dashboard':
                return {
                    content: {
                        display: 'grid',
                        gridTemplateColumns: DS.patterns.dashboard.gridLayout.columns,
                        gap: DS.patterns.dashboard.gridLayout.gap,
                    },
                };
            case 'dataTable':
                return {
                    content: {
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: DS.spacing[6],
                    },
                };
            default:
                return {
                    content: {
                        display: 'block',
                    },
                };
        }
    };

    const layoutStyles = getLayoutStyles();

    return (
        <div
            className={cn("min-h-screen", className)}
            style={{
                fontFamily: styles.typography.fontFamily,
                backgroundColor: `hsl(var(--background))`,
                color: `hsl(var(--foreground))`,
            }}
        >
            {/* Sidebar */}
            {showSidebar && (
                <>
                    {/* Mobile overlay */}
                    {isMobile && sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside
                        className={cn(
                            "fixed left-0 top-0 z-50 transition-transform lg:translate-x-0",
                            isMobile && !sidebarOpen && "-translate-x-full"
                        )}
                        style={{
                            ...styles.sidebar,
                            transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
                        }}
                    >
                        {sidebarContent}
                    </aside>
                </>
            )}

            {/* Main Content Area */}
            <div
                className={cn("transition-all duration-300")}
                style={{
                    marginLeft: showSidebar && !isMobile ? styles.sidebar.width : '0',
                }}
            >
                {/* Header */}
                {headerContent && (
                    <Header className="border-b">
                        {headerContent}
                    </Header>
                )}

                {/* Main Content */}
                <main
                    className="p-6"
                    style={{
                        minHeight: showSidebar ? 'calc(100vh - 64px)' : '100vh',
                        ...layoutStyles.content,
                    }}
                >
                    {children}
                </main>
            </div>

            {/* Mobile sidebar toggle button */}
            {showSidebar && isMobile && (
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed bottom-4 right-4 z-50 lg:hidden"
                    style={{
                        ...styles.button.primary,
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

// Export additional components for use
export { Card, Button, Table, SidebarNavigation, Header };

// Export types
export type {
    UniversityPortalLayoutProps,
    NavigationItem,
    SidebarSection,
    CardProps,
    ButtonProps,
    TableProps
};

// Default export
export default UniversityPortalLayout; 