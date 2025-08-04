
api@help: ## 📋 Show this help message with all available targets
	cd src/api
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

api@info: ## 📋 Show project information and current configuration
	cd src/api
	@echo ""
	@echo "🏛️  Project Information:"
	@echo "  📛 Name: $(PROJECT_NAME)"
	@echo "  📝 Title: $(PROJECT_TITLE)"
	@echo "  � Description: $(PROJECT_DESCRIPTION)"
	@echo "  🔢 Version: $(VERSION)"
	@echo "  🆔 Build ID: $(BUILD_ID)"
	@echo "  🌐 Domain: $(DOMAIN)"
	@echo ""
	@echo "🔧 Development Configuration:"
	@echo "  📦 Node Version: $(NVM_NODE_VERSION)"
	@echo "  🌐 Dev Port: $(DEV_PORT)"
	@echo "  🔍 Preview Port: $(PREVIEW_PORT)"
	@echo "  🏗️  Build Mode: $(BUILD_MODE)"
	@echo "  🗺️  Source Maps: $(SOURCE_MAP)"
	@echo ""
	@echo "👤 System Information:"
	@echo "  � Shell: $(SHELL_NAME) $(SHELL_VERSION)"
	@echo "  👤 User: $(USERNAME) ($(UID):$(GID))"
	@echo ""

api@install: ## 📦 Install all project dependencies
	cd src/api
	@echo "� Installing dependencies for Azure Functions backend..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "� NPM version: $$(npm --version)"
	@echo "� Application version: $(VERSION)-$(BUILD_ID)"
	@npm install --legacy-peer-deps
	@echo "✅ Dependencies installed successfully!"

api@setup: api@install ## 🚀 Complete project setup (install + environment check)
	cd src/api
	@echo "🚀 Setting up $(PROJECT_TITLE) development environment..."
	@$(MAKE) deps-check
	@$(MAKE) type-check
	@echo "✅ Project setup complete! Run 'make dev' to start development."

#===================================================================================================
#=== Build Targets
#===================================================================================================

api@build: ## 🔨 Build Azure Functions backend for production
	cd src/api
	@echo "🔨 Building Azure Functions backend for production..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "� NPM version: $$(npm --version)"
	@echo "🧹 Cleaning previous build..."
	@rm -rf dist/
	@echo "🔨 Building with NestJS..."
	@npm run build
	@echo "✅ Backend built successfully!"
	@echo "� Built files are in the dist/ directory:"
	@ls -la dist/ | head -10
	@echo "� Build size analysis:"
	@du -sh dist/
	@echo "🎉 Backend build complete!"

api@build-staging: ## � Build application for staging environment
	cd src/api
	@echo "🔨 Building $(PROJECT_TITLE) for staging..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@NODE_ENV=staging VITE_APP_VERSION=$(VERSION)-staging VITE_BUILD_ID=$(BUILD_ID) npm run build
	@echo "✅ Staging build complete!"

api@build-analyze: build ## � Build and analyze bundle size
	cd src/api
	@echo "� Analyzing bundle size..."
	@npx vite-bundle-analyzer dist/


#===================================================================================================
#=== Development Targets
#===================================================================================================

api@dev-check: ## 🔍 Run pre-development checks (types, lint, format)
	cd src/api
	@echo "🔍 Running pre-development checks..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@npm run dev:check
	@echo "✅ Pre-development checks passed!"

api@dev: ## 🚀 Start Azure Functions backend in hybrid mode
	cd src/api
	@echo "🚀 Starting Azure Functions backend in hybrid mode..."
	@echo "📍 Functions will be available at: http://localhost:$(API_FAPP_DEV_PORT)"
	@echo "🏗️ Architecture: Hybrid (NestJS HTTP + Native Triggers)"
	@echo "📖 API endpoints:"
	@echo "  • POST /api/storage/generate-sas - Generate SAS tokens"
	@echo "  • POST /api/validation/uuid - Validate UUIDs"
	@echo "  • GET  /api/health - Health check"
	@echo "  • GET  /api/docs - Swagger documentation"
	@echo "⚡ Native Functions:"
	@echo "  • Timer: schedule-cleanup (daily at 2 AM UTC)"
	@echo "  • Queue: queue-processor (task-queue)"
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@echo "� Node.js version: $$(node --version)"
	npm run dev

api@dev-nestjs: ## 🚀 Start NestJS HTTP development server (without pre-checks)
	cd src/api
	@echo "🚀 Starting NestJS HTTP development server..."
	@echo "📍 Server will be available at: http://localhost:$(API_NEST_DEV_PORT)"
	@echo "📖 API docs will be available at: http://localhost:$(API_NEST_DEV_PORT)/api/docs"
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@npm run start:debug

api@dev-adapter: ## 🚀 Start NestJS with Serverless Adapter (development)
	cd src/api
	@echo "🚀 Starting NestJS with H4AD Serverless Adapter..."
	@echo "📍 Server will be available at: http://localhost:$(API_NEST_DEV_PORT)"
	@echo "📖 API docs will be available at: http://localhost:$(API_NEST_DEV_PORT)/api/docs"
	@echo "🔧 Architecture: H4AD Serverless Adapter + NestJS"
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@npm run start:adapter

api@dev-strict: ## 🚀 Start development server with strict pre-checks + Azure Storage Emulator
	cd src/api
	@echo "🚀 Starting $(PROJECT_TITLE) development server with strict checks..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "🔍 Running pre-development checks..."
	@$(MAKE) dev-check
	@echo "✅ Pre-development checks passed!"
	@echo "🌐 Starting parallel services with Azure Storage Emulator..."
	npm run dev:strict

api@preview: api@build ## 🔍 Preview production build locally
	cd src/api
	@echo "� Starting preview server for production build..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "🌐 Starting preview server on http://$(DEV_HOST):$(PREVIEW_PORT)"
	@npm run preview

api@serve: api@build ## 🌐 Serve production build locally
	cd src/api
	@echo "🌐 Serving production build..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@echo "📁 Serving from dist/ directory"
	@npx serve dist -p $(DEV_PORT) -s
	@echo "🌐 Application available at http://$(DEV_HOST):$(DEV_PORT)"

#===================================================================================================
#=== Security and Maintenance Targets
#===================================================================================================

api@audit: ## 🔒 Run npm security audit
	cd src/api
	@echo "� Running security audit..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npm audit --audit-level=moderate
	@echo "✅ Security audit completed!"

api@security-audit: ## 🔒 Run comprehensive security audit with fix suggestions
	cd src/api
	@echo "� Running comprehensive security audit..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npm audit --audit-level=low
	@echo "💡 To fix issues automatically, run: npm audit fix"
	@echo "✅ Security audit completed!"

api@update: ## 📦 Update npm dependencies (interactive)
	cd src/api
	@echo "� Updating dependencies..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npx npm-check-updates --interactive
	@echo "✅ Dependencies updated!"

api@deps-check: ## 🔍 Check for outdated dependencies
	cd src/api
	@echo "� Checking for outdated dependencies..."
	@source ${NVM_DIR}/nvm.sh
	@nvm use ${NVM_NODE_VERSION}
	@npm outdated || true
	@echo "✅ Dependency check completed!"

#===================================================================================================
#=== Azure Functions Specific Targets
#===================================================================================================



api@start: ## ⚡ Start Azure Functions backend
	cd src/api
	@echo "⚡ Starting Azure Functions backend..."
	@echo "📍 Functions Host: http://localhost:$(API_FAPP_DEV_PORT)"
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	func start --port $(API_FAPP_DEV_PORT)

api@stop: ## ⏹️ Stop Azure Functions backend
	cd src/api
	@echo "⏹️ Stopping Azure Functions backend..."
	pkill -f "func start" || true
	pkill -f "Azure.Functions.Cli" || true
	@echo "✅ Azure Functions stopped"

api@status: ## 📊 Check backend status
	cd src/api
	@echo "📊 Azure Functions backend status:"
	@if pgrep -f "func start" > /dev/null; then \
		echo "✅ Backend is running"; \
		echo "📍 Available at: http://localhost:$(API_FAPP_DEV_PORT)"; \
	else \
		echo "❌ Backend is not running"; \
	fi

api@logs: ## 📋 Show backend logs
	cd src/api
	@echo "📋 Showing Azure Functions logs..."
	@if [ -f "$(HOME)/.azure-functions-core-tools/logs/host.log" ]; then \
		tail -f "$(HOME)/.azure-functions-core-tools/logs/host.log"; \
	else \
		echo "⚠️ No log file found. Make sure Azure Functions is running."; \
	fi

api@health: ## 🏥 Check backend health
	cd src/api
	@echo "🏥 Checking backend health..."
	@if curl -s -f http://localhost:$(API_FAPP_DEV_PORT)/api/health > /dev/null 2>&1; then \
		echo "✅ Backend is healthy"; \
		curl -s http://localhost:$(API_FAPP_DEV_PORT)/api/health | jq . || curl -s http://localhost:$(API_FAPP_DEV_PORT)/api/health; \
	else \
		echo "❌ Backend is not responding"; \
		echo "💡 Start it with: make api@dev"; \
	fi

api@test-sas: ## 🔐 Test SAS token generation
	cd src/api
	@echo "🔐 Testing SAS token generation..."
	@if curl -s -f http://localhost:$(API_FAPP_DEV_PORT)/api/health > /dev/null 2>&1; then \
		echo "📡 Sending SAS token request..."; \
		curl -X POST http://localhost:$(API_FAPP_DEV_PORT)/api/storage/generate-sas \
			-H "Content-Type: application/json" \
			-d '{"containerName": "reservations", "permissions": "rw", "expiryHours": 24}' \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Backend is not running. Start it with: make api@dev"; \
	fi

api@test-validation: ## ✅ Test validation endpoints
	cd src/api
	@echo "✅ Testing validation endpoints..."
	@if curl -s -f http://localhost:$(API_FAPP_DEV_PORT)/api/health > /dev/null 2>&1; then \
		echo "📡 Testing UUID validation..."; \
		curl -X POST http://localhost:$(API_FAPP_DEV_PORT)/api/validation/uuid \
			-H "Content-Type: application/json" \
			-d '{"uuid": "123e4567-e89b-12d3-a456-426614174000"}' \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Backend is not running. Start it with: make api@dev"; \
	fi

api@docs: ## 📖 Open API documentation
	cd src/api
	@echo "📖 Opening API documentation..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open http://localhost:$(API_FAPP_DEV_PORT)/api/docs; \
	elif command -v open > /dev/null; then \
		open http://localhost:$(API_FAPP_DEV_PORT)/api/docs; \
	else \
		echo "📍 API docs available at: http://localhost:$(API_FAPP_DEV_PORT)/api/docs"; \
	fi

api@docs-nestjs: ## 📖 Open NestJS API documentation
	cd src/api
	@echo "📖 Opening NestJS API documentation..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open http://localhost:$(API_NEST_DEV_PORT)/api/docs; \
	elif command -v open > /dev/null; then \
		open http://localhost:$(API_NEST_DEV_PORT)/api/docs; \
	else \
		echo "📍 NestJS API docs available at: http://localhost:$(API_NEST_DEV_PORT)/api/docs"; \
	fi

#===================================================================================================
#=== Payment API Testing Targets
#===================================================================================================

api@test-payment-status: ## 🏥 Test payment service status
	cd src/api
	@echo "🏥 Testing payment service status..."
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "✅ Payment service is running"; \
		curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/status | jq . || curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/status; \
	else \
		echo "❌ Payment service is not responding"; \
		echo "💡 Start it with: make api@dev-nestjs"; \
	fi

api@create-reservation: ## 📝 Create a sample tourist tax reservation
	cd src/api
	@echo "📝 Creating sample tourist tax reservation..."
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Sending reservation creation request..."; \
		curl -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations \
			-H "Content-Type: application/json" \
			-d '{"guestName":"Jan Kowalski","guestEmail":"jan.kowalski@example.com","accommodationName":"Hotel Test","accommodationAddress":"ul. Testowa 1, 31-000 Kraków","checkInDate":"2025-08-15","checkOutDate":"2025-08-18","numberOfGuests":2,"numberOfNights":3,"taxAmountPerNight":2.50,"totalTaxAmount":15.00,"currency":"PLN","cityName":"Kraków"}' \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@list-reservations: ## 📋 List all reservations
	cd src/api
	@echo "📋 Fetching all reservations..."
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Fetching reservations..."; \
		curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations \
			| jq . || curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@initiate-payment: ## 💳 Initiate payment for a reservation (requires RESERVATION_ID)
	cd src/api
	@echo "💳 Initiating payment for reservation..."
	@if [ -z "$(RESERVATION_ID)" ]; then \
		echo "❌ RESERVATION_ID is required. Usage: make api@initiate-payment RESERVATION_ID=your-uuid"; \
		echo "💡 Get reservation IDs with: make api@list-reservations"; \
		exit 1; \
	fi
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Initiating payment for reservation $(RESERVATION_ID)..."; \
		curl -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/initiate \
			-H "Content-Type: application/json" \
			-d '{"reservationId":"$(RESERVATION_ID)","successUrl":"http://localhost:3040/payment/success","failureUrl":"http://localhost:3040/payment/failure"}' \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@payment-status: ## 📊 Check payment status (requires PAYMENT_ID)
	cd src/api
	@echo "📊 Checking payment status..."
	@if [ -z "$(PAYMENT_ID)" ]; then \
		echo "❌ PAYMENT_ID is required. Usage: make api@payment-status PAYMENT_ID=your-payment-id"; \
		echo "💡 Get payment IDs with: make api@list-payments"; \
		exit 1; \
	fi
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Fetching payment status for $(PAYMENT_ID)..."; \
		curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/$(PAYMENT_ID)/status \
			| jq . || curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/$(PAYMENT_ID)/status; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@list-payments: ## 💰 List all payments
	cd src/api
	@echo "💰 Fetching all payments..."
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Fetching payments..."; \
		curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/payments \
			| jq . || curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/payments; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@simulate-webhook: ## 🔔 Simulate payment webhook (requires PAYMENT_ID and STATUS)
	cd src/api
	@echo "🔔 Simulating payment webhook..."
	@if [ -z "$(PAYMENT_ID)" ]; then \
		echo "❌ PAYMENT_ID is required. Usage: make api@simulate-webhook PAYMENT_ID=your-payment-id STATUS=completed"; \
		echo "💡 Valid statuses: pending, processing, completed, failed, cancelled"; \
		exit 1; \
	fi
	@if [ -z "$(STATUS)" ]; then \
		echo "❌ STATUS is required. Usage: make api@simulate-webhook PAYMENT_ID=your-payment-id STATUS=completed"; \
		echo "💡 Valid statuses: pending, processing, completed, failed, cancelled"; \
		exit 1; \
	fi
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Sending webhook for payment $(PAYMENT_ID) with status $(STATUS)..."; \
		curl -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/webhook \
			-H "Content-Type: application/json" \
			-d "{\"paymentId\":\"$(PAYMENT_ID)\",\"status\":\"$(STATUS)\",\"amount\":15.00,\"currency\":\"PLN\",\"transactionId\":\"txn_$$(date +%s)_test\",\"timestamp\":\"$$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@get-reservation: ## 🔍 Get specific reservation (requires RESERVATION_ID)
	cd src/api
	@echo "🔍 Fetching reservation details..."
	@if [ -z "$(RESERVATION_ID)" ]; then \
		echo "❌ RESERVATION_ID is required. Usage: make api@get-reservation RESERVATION_ID=your-uuid"; \
		echo "💡 Get reservation IDs with: make api@list-reservations"; \
		exit 1; \
	fi
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Fetching reservation $(RESERVATION_ID)..."; \
		curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations/$(RESERVATION_ID) \
			| jq . || curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations/$(RESERVATION_ID); \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@delete-reservation: ## 🗑️ Delete specific reservation (requires RESERVATION_ID)
	cd src/api
	@echo "🗑️ Deleting reservation..."
	@if [ -z "$(RESERVATION_ID)" ]; then \
		echo "❌ RESERVATION_ID is required. Usage: make api@delete-reservation RESERVATION_ID=your-uuid"; \
		echo "💡 Get reservation IDs with: make api@list-reservations"; \
		exit 1; \
	fi
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Deleting reservation $(RESERVATION_ID)..."; \
		curl -X DELETE http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations/$(RESERVATION_ID) \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@clear-payment-data: ## 🧹 Clear all payment data and reseed with mock data
	cd src/api
	@echo "🧹 Clearing all payment data..."
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo "📡 Clearing all data..."; \
		curl -X DELETE http://localhost:$(API_NEST_DEV_PORT)/api/payment/clear-all \
			| jq . || echo "Response received (jq not available)"; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi

api@demo-payment-flow: ## 🎬 Run complete payment flow demo
	cd src/api
	@echo "🎬 Running complete payment flow demo..."
	@if curl -s -f http://localhost:$(API_NEST_DEV_PORT)/api/payment/status > /dev/null 2>&1; then \
		echo ""; \
		echo "🎯 Step 1: Creating reservation..."; \
		RESERVATION_RESPONSE=$$(curl -s -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/reservations \
			-H "Content-Type: application/json" \
			-d '{"guestName":"Demo User","guestEmail":"demo@example.com","accommodationName":"Demo Hotel","accommodationAddress":"ul. Demo 1, 31-000 Kraków","checkInDate":"2025-08-15","checkOutDate":"2025-08-17","numberOfGuests":1,"numberOfNights":2,"taxAmountPerNight":2.50,"totalTaxAmount":5.00,"currency":"PLN","cityName":"Kraków"}'); \
		RESERVATION_ID=$$(echo $$RESERVATION_RESPONSE | jq -r '.id' 2>/dev/null || echo ""); \
		if [ -n "$$RESERVATION_ID" ] && [ "$$RESERVATION_ID" != "null" ]; then \
			echo "✅ Reservation created: $$RESERVATION_ID"; \
			echo ""; \
			echo "🎯 Step 2: Initiating payment..."; \
			PAYMENT_RESPONSE=$$(curl -s -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/initiate \
				-H "Content-Type: application/json" \
				-d "{ \
					\"reservationId\": \"$$RESERVATION_ID\", \
					\"successUrl\": \"http://localhost:3040/payment/success\", \
					\"failureUrl\": \"http://localhost:3040/payment/failure\" \
				}"); \
			PAYMENT_ID=$$(echo $$PAYMENT_RESPONSE | jq -r '.paymentId' 2>/dev/null || echo ""); \
			if [ -n "$$PAYMENT_ID" ] && [ "$$PAYMENT_ID" != "null" ]; then \
				echo "✅ Payment initiated: $$PAYMENT_ID"; \
				echo ""; \
				echo "🎯 Step 3: Simulating payment completion..."; \
				sleep 2; \
				curl -s -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/webhook \
					-H "Content-Type: application/json" \
					-d "{\"paymentId\":\"$$PAYMENT_ID\",\"status\":\"processing\",\"amount\":5.00,\"currency\":\"PLN\",\"transactionId\":\"txn_demo_$$(date +%s)\",\"timestamp\":\"$$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > /dev/null; \
				sleep 1; \
				curl -s -X POST http://localhost:$(API_NEST_DEV_PORT)/api/payment/webhook \
					-H "Content-Type: application/json" \
					-d "{\"paymentId\":\"$$PAYMENT_ID\",\"status\":\"completed\",\"amount\":5.00,\"currency\":\"PLN\",\"transactionId\":\"txn_demo_$$(date +%s)\",\"timestamp\":\"$$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > /dev/null; \
				echo "✅ Payment completed via webhook"; \
				echo ""; \
				echo "🎯 Step 4: Checking final status..."; \
				curl -s http://localhost:$(API_NEST_DEV_PORT)/api/payment/$$PAYMENT_ID/status | jq . || echo "Final status check completed"; \
				echo ""; \
				echo "🎉 Demo completed successfully!"; \
				echo "📍 Reservation ID: $$RESERVATION_ID"; \
				echo "📍 Payment ID: $$PAYMENT_ID"; \
			else \
				echo "❌ Failed to initiate payment"; \
			fi; \
		else \
			echo "❌ Failed to create reservation"; \
		fi; \
	else \
		echo "❌ Payment service is not running. Start it with: make api@dev-nestjs"; \
	fi
