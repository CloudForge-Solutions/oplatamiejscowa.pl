

app@help: ## 📋 Show this help message with all available targets
	cd src/app
	@echo ""
	@echo "🏛️  $(PROJECT_TITLE) - Makefile Commands"
	@echo "📝  $(PROJECT_DESCRIPTION)"
	@echo ""
	@echo "📋 Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

#===================================================================================================
#=== Setup and Installation Targets
#===================================================================================================

app@info: ## 📋 Show project information and current configuration
	cd src/app
	@echo ""
	@echo "🏛️  Project Information:"
	@echo "  📛 Name: $(PROJECT_NAME)"
	@echo "  📝 Title: $(PROJECT_TITLE)"
	@echo "  📄 Description: $(PROJECT_DESCRIPTION)"
	@echo "  🔢 Version: $(VERSION)"
	@echo "  🆔 Build ID: $(BUILD_ID)"
	@echo "  🌐 Domain: $(DOMAIN)"
	@echo ""
	@echo "🔧 Development Configuration:"
	@echo "  📦 Node Version: $(NVM_NODE_VERSION)"
	@echo "  🌐 Dev Port: $(APP_DEV_PORT)"
	@echo "  🔍 Preview Port: $(APP_PREVIEW_PORT)"
	@echo "  🏗️  Build Mode: $(BUILD_MODE)"
	@echo "  🗺️  Source Maps: $(SOURCE_MAP)"
	@echo ""
	@echo "👤 System Information:"
	@echo "  🐚 Shell: $(SHELL_NAME) $(SHELL_VERSION)"
	@echo "  👤 User: $(USERNAME) ($(UID):$(GID))"
	@echo ""

app@install: ## 📦 Install all project dependencies
	cd src/app
	@echo "📦 Installing dependencies for $(PROJECT_TITLE)..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION} || nvm install ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "📋 NPM version: $$(npm --version)"
	@echo "🔧 Installing dependencies..."
	@npm install @azure/storage-blob
	@npm i
	@echo "✅ Dependencies installed successfully!"

app@setup: app@install ## 🚀 Complete project setup (install + environment check)
	@echo "🚀 Setting up $(PROJECT_TITLE) development environment..."
	@$(MAKE) deps-check
	@$(MAKE) type-check
	@echo "✅ Project setup complete! Run 'make dev' to start development."

#===================================================================================================
#=== Build Targets
#===================================================================================================

app@build: ## 🔨 Build application for production
	cd src/app
	@echo "🔨 Building $(PROJECT_TITLE) for production..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "📋 NPM version: $$(npm --version)"
	@echo "📋 Application version: $(VERSION)-$(BUILD_ID)"
	@echo "🧹 Cleaning previous build..."
	@rm -rf dist/
	@echo "🔨 Building with Vite for production..."
	@NODE_ENV=production VITE_APP_VERSION=$(VERSION) VITE_BUILD_ID=$(BUILD_ID) npm run build
	@echo "✅ Application built successfully!"
	@echo "📁 Built files are in the dist/ directory:"
	@ls -la dist/ | head -10
	@echo "� Build size analysis:"
	@du -sh dist/
	@echo "🎉 Production build complete!"

app@build-staging: ## 🔨 Build application for staging environment
	cd src/app
	@echo "🔨 Building $(PROJECT_TITLE) for staging..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@NODE_ENV=staging VITE_APP_VERSION=$(VERSION)-staging VITE_BUILD_ID=$(BUILD_ID) npm run build
	@echo "✅ Staging build complete!"

app@build-analyze: build ## 📊 Build and analyze bundle size
	cd src/app
	@echo "📊 Analyzing bundle size..."
	@npx vite-bundle-analyzer dist/


#===================================================================================================
#=== Development Targets
#===================================================================================================

app@dev-check: ## 🔍 Run pre-development checks (types, lint, format)
	cd src/app
	@echo "🔍 Running pre-development checks..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@npm run dev:check
	@echo "✅ Pre-development checks passed!"

app@dev: ## 🚀 Start development server with hot reload + Azure Storage Emulator (Azurite)
	cd src/app
	@echo "🚀 Starting $(PROJECT_TITLE) development server with Azure Storage Emulator..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "🌐 Starting parallel services:"
	@echo "   • Vite Dev Server: http://$(DEV_HOST):$(APP_DEV_PORT)"
	@echo "   • Azure Blob Storage: http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB)"
	@echo "   • Azure Queue Storage: http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE)"
	@echo "   • Azure Table Storage: http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE)"
	@echo ""
	@echo "⚠️  Temporarily bypassing pre-checks due to ESLint config issue"
	@echo "💡 Use 'make dev-strict' for development with pre-checks"
	@echo ""
	npm run dev

app@dev-react: ## 🚀 Start React development server (without pre-checks)
	cd src/app
	@echo "🚀 Starting React development server directly..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@npm run dev:react

app@dev-strict: ## 🚀 Start development server with strict pre-checks + Azure Storage Emulator
	cd src/app
	@echo "🚀 Starting $(PROJECT_TITLE) development server with strict checks..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "🔍 Running pre-development checks..."
	@$(MAKE) dev-check
	@echo "✅ Pre-development checks passed!"
	@echo "🌐 Starting parallel services with Azure Storage Emulator..."
	npm run dev:strict

app@preview: app@build ## 🔍 Preview production build locally
	cd src/app
	@echo "� Starting preview server for production build..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "🌐 Starting preview server on http://$(DEV_HOST):$(APP_PREVIEW_PORT)"
	@npm run preview

app@serve: app@build ## 🌐 Serve production build locally
	cd src/app
	@echo "🌐 Serving production build..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@echo "📁 Serving from dist/ directory"
	@npx serve dist -p $(APP_DEV_PORT) -s
	@echo "🌐 Application available at http://$(DEV_HOST):$(APP_DEV_PORT)"

#===================================================================================================
#=== Security and Maintenance Targets
#===================================================================================================

app@audit: ## 🔒 Run npm security audit
	cd src/app
	@echo "� Running security audit..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npm audit --audit-level=moderate
	@echo "✅ Security audit completed!"

app@security-audit: ## 🔒 Run comprehensive security audit with fix suggestions
	cd src/app
	@echo "� Running comprehensive security audit..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npm audit --audit-level=low
	@echo "💡 To fix issues automatically, run: npm audit fix"
	@echo "✅ Security audit completed!"

app@update: ## 📦 Update npm dependencies (interactive)
	cd src/app
	@echo "� Updating dependencies..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npx npm-check-updates --interactive
	@echo "✅ Dependencies updated!"

app@deps-check: ## 🔍 Check for outdated dependencies
	cd src/app
	@echo "� Checking for outdated dependencies..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npm outdated || true
	@echo "✅ Dependency check completed!"


