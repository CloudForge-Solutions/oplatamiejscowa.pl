#!/usr/bin/env python3
"""
Analyze README.plans.md for technical issues and hallucinations
"""

import re
import sys
import os

def analyze_plans():
    """Analyze the plans file for issues"""
    issues = []

    try:
        with open('README.plans.md', 'r') as f:
            content = f.read()
            lines = content.split('\n')

        print("🔍 Analyzing README.plans.md for issues...")
        print("=" * 60)

        # Check for version issues
        react_versions = re.findall(r'React (\d+\.\d+(?:\.\d+)?)', content)
        for version in react_versions:
            if version == '18.3':
                issues.append(f'❌ CRITICAL: React {version} does not exist. Use React 18.2.x')

        # Check for TypeScript issues
        ts_versions = re.findall(r'TypeScript (\d+\.\d+(?:\.\d+)?)', content)
        for version in ts_versions:
            if version == '5.3':
                issues.append(f'⚠️  WARNING: TypeScript {version} may have compatibility issues')

        # GitHub Pages + Azure Functions is a valid architecture (separate deployments)
        # No issue here - GitHub Pages serves static frontend, Azure Functions serves backend API

        # Check for SAS token service in frontend (not backend)
        if 'SASTokenService.ts' in content and 'src/services/' in content and 'functions/src/services/' not in content:
            issues.append('🚨 SECURITY: SAS token service should not be in frontend')
        elif 'SASTokenService.ts' in content and 'src/services/' in content and 'functions/src/services/' in content:
            # This is correct - SAS service in backend
            pass

        if 'DataRetentionService.ts' in content and 'src/services/' in content:
            issues.append('🏗️  ARCHITECTURE: Data retention service belongs in backend')

        # Check for performance issues
        if 'Queue Polling' in content and 'browser' in content.lower():
            issues.append('⚡ PERFORMANCE: Browser queue polling is inefficient')

        # GitHub Pages + Azure Functions is a valid separate deployment architecture
        # This is actually a good pattern: static frontend + serverless backend

        # Check for CORS configuration mention
        if 'Direct Blob Access' in content and 'browser' in content.lower() and 'CORS' not in content:
            issues.append('💡 SUGGESTION: Document Azure Storage CORS configuration for direct blob access')

        print("📊 Analysis Results:")
        if issues:
            for i, issue in enumerate(issues, 1):
                print(f"  {i}. {issue}")
        else:
            print("  ✅ No major issues detected")

        print("=" * 60)
        print(f"Total issues found: {len(issues)}")

        return len(issues)

    except FileNotFoundError:
        print('❌ README.plans.md not found')
        return 1
    except Exception as e:
        print(f'❌ Error analyzing file: {e}')
        return 1

if __name__ == '__main__':
    sys.exit(analyze_plans())
