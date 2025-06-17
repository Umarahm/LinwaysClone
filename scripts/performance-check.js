#!/usr/bin/env node

/**
 * Performance Check Script
 * Validates performance optimizations and generates a report
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Performance Optimization Check');
console.log('=====================================\n');

// Check Next.js configuration
function checkNextConfig() {
    console.log('📋 Checking Next.js Configuration...');

    try {
        const configPath = path.join(process.cwd(), 'next.config.mjs');
        const configContent = fs.readFileSync(configPath, 'utf8');

        const checks = [
            { name: 'Image optimization enabled', check: !configContent.includes('unoptimized: true') },
            { name: 'Compression enabled', check: configContent.includes('compress: true') },
            { name: 'SWC minification enabled', check: configContent.includes('swcMinify: true') },
            { name: 'Bundle analyzer configured', check: configContent.includes('@next/bundle-analyzer') },
            { name: 'Package optimization configured', check: configContent.includes('optimizePackageImports') }
        ];

        checks.forEach(check => {
            console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
        });

        console.log();
        return checks.every(check => check.check);
    } catch (error) {
        console.log('   ❌ Error reading Next.js config');
        return false;
    }
}

// Check font optimization
function checkFontOptimization() {
    console.log('🔤 Checking Font Optimization...');

    try {
        const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');

        const checks = [
            { name: 'Google Fonts import', check: layoutContent.includes('next/font/google') },
            { name: 'Font display swap', check: layoutContent.includes('display: \'swap\'') },
            { name: 'Font preloading', check: layoutContent.includes('preload: true') }
        ];

        checks.forEach(check => {
            console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
        });

        console.log();
        return checks.every(check => check.check);
    } catch (error) {
        console.log('   ❌ Error reading layout file');
        return false;
    }
}

// Check for React.memo usage
function checkReactMemoUsage() {
    console.log('⚛️  Checking React.memo Usage...');

    const componentsToCheck = [
        'components/theme-provider.tsx'
    ];

    let memoizedComponents = 0;

    componentsToCheck.forEach(componentPath => {
        try {
            const fullPath = path.join(process.cwd(), componentPath);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const hasMemo = content.includes('React.memo');
                console.log(`   ${hasMemo ? '✅' : '❌'} ${componentPath.split('/').pop()}`);
                if (hasMemo) memoizedComponents++;
            }
        } catch (error) {
            console.log(`   ❌ Error checking ${componentPath}`);
        }
    });

    console.log();
    return memoizedComponents > 0;
}

// Check bundle size (requires build)
function checkBundleAnalyzer() {
    console.log('📦 Checking Bundle Analyzer Setup...');

    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        const checks = [
            { name: 'Bundle analyzer installed', check: packageContent.devDependencies?.['@next/bundle-analyzer'] },
            { name: 'Analyze script available', check: packageContent.scripts?.analyze }
        ];

        checks.forEach(check => {
            console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
        });

        console.log();
        return checks.every(check => check.check);
    } catch (error) {
        console.log('   ❌ Error reading package.json');
        return false;
    }
}

// Performance recommendations
function generateRecommendations() {
    console.log('💡 Performance Recommendations:');
    console.log('================================');
    console.log('1. Run "npm run analyze" to see bundle size breakdown');
    console.log('2. Use dynamic imports for large components that aren\'t immediately needed');
    console.log('3. Implement React.memo() for components that re-render frequently');
    console.log('4. Use useMemo() and useCallback() for expensive calculations');
    console.log('5. Optimize images using Next.js Image component');
    console.log('6. Consider implementing virtual scrolling for large lists');
    console.log('7. Use Server Components where possible to reduce client-side JavaScript');
    console.log();
}

// Main execution
async function main() {
    const results = [];

    results.push(checkNextConfig());
    results.push(checkFontOptimization());
    results.push(checkReactMemoUsage());
    results.push(checkBundleAnalyzer());

    const overallScore = results.filter(Boolean).length;
    const totalChecks = results.length;

    console.log(`📊 Performance Score: ${overallScore}/${totalChecks} (${Math.round(overallScore / totalChecks * 100)}%)`);
    console.log();

    if (overallScore === totalChecks) {
        console.log('🎉 Excellent! All performance optimizations are in place.');
    } else {
        console.log('⚠️  Some optimizations are missing. Check the items marked with ❌ above.');
    }

    console.log();
    generateRecommendations();
}

main().catch(console.error); 