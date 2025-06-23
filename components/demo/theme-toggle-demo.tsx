'use client';

import React from 'react';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Moon, Settings } from 'lucide-react';
import designSystem from '@/university_design_system.json';

const DS = designSystem.designSystem;

export const ThemeToggleDemo: React.FC = () => {
    return (
        <div
            className="min-h-screen bg-background p-6 transition-colors duration-300"
            style={{ fontFamily: DS.typography.fontFamily.primary }}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div
                            className="p-3 rounded-lg bg-primary/10"
                            style={{ borderRadius: DS.components.cards.default.borderRadius }}
                        >
                            <Palette
                                className="text-primary"
                                style={{
                                    width: DS.iconography.sizes.lg,
                                    height: DS.iconography.sizes.lg
                                }}
                            />
                        </div>
                        <h1
                            className="font-bold text-foreground"
                            style={{
                                fontSize: DS.typography.fontSizes['3xl'],
                                fontWeight: DS.typography.fontWeights.bold,
                            }}
                        >
                            Theme Toggle Demo
                        </h1>
                    </div>
                    <p
                        className="text-muted-foreground max-w-2xl mx-auto"
                        style={{
                            fontSize: DS.typography.fontSizes.lg,
                            lineHeight: DS.typography.lineHeights.relaxed,
                        }}
                    >
                        Experience the design system compliant theme toggle with smooth transitions between light and dark modes.
                    </p>
                </div>

                {/* Theme Toggle Variants */}
                <Card
                    className="overflow-hidden"
                    style={{
                        borderRadius: DS.components.cards.elevated.borderRadius,
                        padding: 0,
                    }}
                >
                    <CardHeader
                        style={{
                            padding: DS.spacing[6],
                            borderBottom: `1px solid hsl(var(--border))`,
                        }}
                    >
                        <CardTitle
                            className="flex items-center gap-2"
                            style={{
                                fontSize: DS.typography.fontSizes.xl,
                                fontWeight: DS.typography.fontWeights.semibold,
                            }}
                        >
                            <Settings style={{ width: DS.iconography.sizes.md, height: DS.iconography.sizes.md }} />
                            Toggle Button Variants
                        </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: DS.spacing[6] }}>
                        <div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                            style={{ gap: DS.spacing[6] }}
                        >
                            {/* Primary Variant */}
                            <div
                                className="text-center space-y-4 p-6 rounded-lg bg-muted/50"
                                style={{
                                    borderRadius: DS.components.cards.default.borderRadius,
                                    padding: DS.spacing[6],
                                }}
                            >
                                <h3
                                    className="font-semibold text-foreground"
                                    style={{
                                        fontSize: DS.typography.fontSizes.lg,
                                        fontWeight: DS.typography.fontWeights.semibold,
                                    }}
                                >
                                    Primary
                                </h3>
                                <ThemeToggleButton variant="primary" size="lg" />
                                <p
                                    className="text-muted-foreground text-sm"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    High emphasis toggle with brand colors
                                </p>
                            </div>

                            {/* Secondary Variant */}
                            <div
                                className="text-center space-y-4 p-6 rounded-lg bg-muted/50"
                                style={{
                                    borderRadius: DS.components.cards.default.borderRadius,
                                    padding: DS.spacing[6],
                                }}
                            >
                                <h3
                                    className="font-semibold text-foreground"
                                    style={{
                                        fontSize: DS.typography.fontSizes.lg,
                                        fontWeight: DS.typography.fontWeights.semibold,
                                    }}
                                >
                                    Secondary
                                </h3>
                                <ThemeToggleButton variant="secondary" size="lg" />
                                <p
                                    className="text-muted-foreground text-sm"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    Subtle toggle for headers and toolbars
                                </p>
                            </div>

                            {/* Filter Variant */}
                            <div
                                className="text-center space-y-4 p-6 rounded-lg bg-muted/50"
                                style={{
                                    borderRadius: DS.components.cards.default.borderRadius,
                                    padding: DS.spacing[6],
                                }}
                            >
                                <h3
                                    className="font-semibold text-foreground"
                                    style={{
                                        fontSize: DS.typography.fontSizes.lg,
                                        fontWeight: DS.typography.fontWeights.semibold,
                                    }}
                                >
                                    Filter
                                </h3>
                                <ThemeToggleButton variant="filter" size="lg" />
                                <p
                                    className="text-muted-foreground text-sm"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    Compact style for filter controls
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Design System Colors Demo */}
                <div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    style={{ gap: DS.spacing[6] }}
                >
                    {/* Color Palette */}
                    <Card>
                        <CardHeader>
                            <CardTitle
                                style={{
                                    fontSize: DS.typography.fontSizes.lg,
                                    fontWeight: DS.typography.fontWeights.semibold,
                                }}
                            >
                                Color Palette
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4
                                    className="font-medium mb-3"
                                    style={{
                                        fontSize: DS.typography.fontSizes.base,
                                        fontWeight: DS.typography.fontWeights.medium,
                                    }}
                                >
                                    Primary Colors
                                </h4>
                                <div
                                    className="flex gap-2"
                                    style={{ gap: DS.spacing[2] }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.primary.brand,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title={DS.colorPalette.primary.brand}
                                    />
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.primary.brandLight,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title={DS.colorPalette.primary.brandLight}
                                    />
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.primary.brandDark,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title={DS.colorPalette.primary.brandDark}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4
                                    className="font-medium mb-3"
                                    style={{
                                        fontSize: DS.typography.fontSizes.base,
                                        fontWeight: DS.typography.fontWeights.medium,
                                    }}
                                >
                                    Status Colors
                                </h4>
                                <div
                                    className="grid grid-cols-4 gap-2"
                                    style={{ gap: DS.spacing[2] }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.status.success,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title="Success"
                                    />
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.status.warning,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title="Warning"
                                    />
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.status.error,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title="Error"
                                    />
                                    <div
                                        className="w-12 h-12 rounded-lg border border-border"
                                        style={{
                                            backgroundColor: DS.colorPalette.status.info,
                                            borderRadius: DS.components.cards.default.borderRadius,
                                        }}
                                        title="Info"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Typography Demo */}
                    <Card>
                        <CardHeader>
                            <CardTitle
                                style={{
                                    fontSize: DS.typography.fontSizes.lg,
                                    fontWeight: DS.typography.fontWeights.semibold,
                                }}
                            >
                                Typography Scale
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="text-foreground"
                                style={{
                                    fontSize: DS.typography.fontSizes['2xl'],
                                    fontWeight: DS.typography.fontWeights.bold,
                                    lineHeight: DS.typography.lineHeights.tight,
                                }}
                            >
                                Large Heading
                            </div>
                            <div
                                className="text-foreground"
                                style={{
                                    fontSize: DS.typography.fontSizes.xl,
                                    fontWeight: DS.typography.fontWeights.semibold,
                                }}
                            >
                                Medium Heading
                            </div>
                            <div
                                className="text-foreground"
                                style={{
                                    fontSize: DS.typography.fontSizes.base,
                                    fontWeight: DS.typography.fontWeights.medium,
                                }}
                            >
                                Body Text Medium
                            </div>
                            <div
                                className="text-muted-foreground"
                                style={{
                                    fontSize: DS.typography.fontSizes.sm,
                                    lineHeight: DS.typography.lineHeights.relaxed,
                                }}
                            >
                                Small text with relaxed line height for comfortable reading and better accessibility.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Components Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle
                            style={{
                                fontSize: DS.typography.fontSizes.xl,
                                fontWeight: DS.typography.fontWeights.semibold,
                            }}
                        >
                            Design System Components
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Buttons */}
                        <div>
                            <h4
                                className="font-medium mb-3"
                                style={{
                                    fontSize: DS.typography.fontSizes.base,
                                    fontWeight: DS.typography.fontWeights.medium,
                                }}
                            >
                                Buttons
                            </h4>
                            <div
                                className="flex flex-wrap gap-3"
                                style={{ gap: DS.spacing[3] }}
                            >
                                <Button variant="default">Primary Button</Button>
                                <Button variant="secondary">Secondary Button</Button>
                                <Button variant="outline">Outline Button</Button>
                                <Button variant="ghost">Ghost Button</Button>
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <h4
                                className="font-medium mb-3"
                                style={{
                                    fontSize: DS.typography.fontSizes.base,
                                    fontWeight: DS.typography.fontWeights.medium,
                                }}
                            >
                                Status Badges
                            </h4>
                            <div
                                className="flex flex-wrap gap-3"
                                style={{ gap: DS.spacing[3] }}
                            >
                                <Badge
                                    className="text-white"
                                    style={{
                                        backgroundColor: DS.colorPalette.status.success,
                                        ...DS.components.badges.success,
                                    }}
                                >
                                    Success
                                </Badge>
                                <Badge
                                    className="text-white"
                                    style={{
                                        backgroundColor: DS.colorPalette.status.info,
                                        ...DS.components.badges.info,
                                    }}
                                >
                                    Info
                                </Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme Info */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <CardContent
                        className="text-center"
                        style={{ padding: DS.spacing[8] }}
                    >
                        <h3
                            className="font-bold mb-4 text-foreground"
                            style={{
                                fontSize: DS.typography.fontSizes['2xl'],
                                fontWeight: DS.typography.fontWeights.bold,
                            }}
                        >
                            🎨 Design System Compliant
                        </h3>
                        <p
                            className="text-muted-foreground max-w-2xl mx-auto"
                            style={{
                                fontSize: DS.typography.fontSizes.lg,
                                lineHeight: DS.typography.lineHeights.relaxed,
                            }}
                        >
                            All components follow the university design system specifications with proper spacing, typography, colors, and interactions.
                            Toggle between light and dark modes to see the seamless theme adaptation.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ThemeToggleDemo; 