#===================================================================================================
#=== Tourist Tax Payment System - Makefile
#===================================================================================================
# Project: Opłata Miejscowa Online
# Description: Tourist tax payment system for Polish cities
# Tech Stack: React + TypeScript + Vite + imoje Payment Gateway
#===================================================================================================

# Force specific make behavior for reliability
.EXPORT_ALL_VARIABLES:
MAKEFLAGS     += --no-builtin-rules
MAKEFLAGS     += --no-print-directory
MAKEFLAGS     += --warn-undefined-variables
MAKEFLAGS     += -j1

# MVP Testing targets
.PHONY: mvp-test mvp-blob mvp-queue mvp-arch mvp-imoje analyze-plans validate-tech stop-mvp

# Azure Storage Emulator targets
.PHONY: storage-emulator storage-start storage-stop storage-test storage-test-blob storage-test-queue storage-test-table storage-status

# Shell configuration for robust script execution
.ONESHELL:
.SHELL        := $(shell which bash)
SHELL         := $(shell which bash)
.SHELLFLAGS   := -eu -o pipefail -c
SHELL_NAME    := $(notdir ${SHELL})
SHELL_VERSION := $(shell echo $${BASH_VERSION%%[^0-9.]*})

#===================================================================================================
#=== Project Configuration
#===================================================================================================

# Load environment variables
-include .env
-include .env.local

# Project metadata
PROJECT_NAME        := oplata-miejscowa
PROJECT_TITLE       := "Opłata Miejscowa Online"
PROJECT_DESCRIPTION := "Tourist tax payment system for Polish cities"
DOMAIN              ?= oplatamiejscowa.pl
VERSION             := $(shell cat VERSION 2>/dev/null || echo "1.0.0")
BUILD_ID            := $(shell date +%Y%m%d-%H%M%S)

# System configuration
UID                 := $(shell id -u)
GID                 := $(shell id -g)
USERNAME            := $(shell whoami)

#===================================================================================================
#=== Development Environment Configuration
#===================================================================================================

# Node.js configuration
NVM_NODE_VERSION    ?= lts/jod
NVM_DIR             := ${HOME}/.nvm
NODE_ENV            ?= development

# Development server configuration
DEV_HOST            ?= localhost

APP_DEV_PORT            ?= 3040
APP_PREVIEW_PORT        ?= 3041

API_FAPP_DEV_PORT            ?= 3042
API_FAPP_PREVIEW_PORT        ?= 3043
API_NEST_DEV_PORT            ?= 3044
API_NEST_PREVIEW_PORT        ?= 3045


# Build configuration
BUILD_MODE          ?= production
VITE_MODE           ?= $(BUILD_MODE)
SOURCE_MAP          ?= true

# Testing configuration
TEST_TIMEOUT        ?= 30000
TEST_COVERAGE       ?= true

# Azure Storage Emulator configuration
AZURITE_PORT_BLOB   ?= 10000
AZURITE_PORT_QUEUE  ?= 10001
AZURITE_PORT_TABLE  ?= 10002
AZURITE_HOST        ?= 127.0.0.1
AZURITE_WORKSPACE   ?= ./azurite-workspace
AZURITE_DEBUG       ?= false
AZURITE_ACCOUNT     ?= devstoreaccount1
AZURITE_KEY         ?= Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==

# Quality assurance configuration
LINT_FIX            ?= false
FORMAT_CHECK        ?= false

#

include src/app/Makefile
include src/api/Makefile











#===================================================================================================
#=== Azure Storage Emulator (Azurite) Targets
#===================================================================================================

storage-emulator: app@storage-start ## 🗄️ Start Azure Storage Emulator (Azurite) with all services
	@echo "✅ Azure Storage Emulator started successfully!"
	@echo "🌐 Blob Service: http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB)"
	@echo "📬 Queue Service: http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE)"
	@echo "📊 Table Service: http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE)"
	@echo "💡 Use 'make storage-test' to run curl tests"
	@echo "💡 Use 'make storage-stop' to stop the emulator"

storage-start: ## 🚀 Start Azurite storage emulator in background
	@echo "🚀 Starting Azure Storage Emulator (Azurite)..."
	@source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION}
	@echo "📋 Node.js version: $$(node --version)"
	@echo "📋 NPM version: $$(npm --version)"
	@mkdir -p $(AZURITE_WORKSPACE)
	@echo "📁 Workspace: $(AZURITE_WORKSPACE)"

	echo "🗄️ Starting Azurite with all services..."
	if [ "$(AZURITE_DEBUG)" = "true" ]; then
		source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION} &&
		npx azurite --silent --location $(AZURITE_WORKSPACE)
			--blobHost $(AZURITE_HOST) --blobPort $(AZURITE_PORT_BLOB)
			--queueHost $(AZURITE_HOST) --queuePort $(AZURITE_PORT_QUEUE)
			--tableHost $(AZURITE_HOST) --tablePort $(AZURITE_PORT_TABLE)
			--debug $(AZURITE_WORKSPACE)/debug.log &
	else
		source ${NVM_DIR}/nvm.sh && nvm use ${NVM_NODE_VERSION} &&
		npx azurite --silent --location $(AZURITE_WORKSPACE)
			--blobHost $(AZURITE_HOST) --blobPort $(AZURITE_PORT_BLOB)
			--queueHost $(AZURITE_HOST) --queuePort $(AZURITE_PORT_QUEUE)
			--tableHost $(AZURITE_HOST) --tablePort $(AZURITE_PORT_TABLE) &
	fi
	echo "⏳ Waiting for Azurite to start..."
	sleep 3
	if pgrep -f "azurite" > /dev/null; then
		echo "✅ Azurite started successfully!"
	else
		echo "❌ Failed to start Azurite. Check if npx and azurite are installed."
		echo "💡 Install with: npm install -g azurite"
		exit 1
	fi

storage-stop: ## ⏹️ Stop Azure Storage Emulator
	@echo "⏹️  Stopping Azure Storage Emulator..."
	@if pgrep -f "azurite" > /dev/null; then
		pkill -f "azurite"
		echo "✅ Azurite stopped successfully!"
	else
		echo "ℹ️  Azurite is not running."
	fi

storage-status: ## 📊 Check Azure Storage Emulator status
	@echo "📊 Azure Storage Emulator Status:"
	@if pgrep -f "azurite" > /dev/null; then
		echo "✅ Status: RUNNING"
		echo "🔍 Process: $$(pgrep -f azurite)"
		echo "🌐 Blob Service: http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB) $$(curl -s -o /dev/null -w '%{http_code}' http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB) 2>/dev/null | grep -q 400 && echo '(✅ Available)' || echo '(❌ Not responding)')"
		echo "📬 Queue Service: http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE) $$(curl -s -o /dev/null -w '%{http_code}' http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE) 2>/dev/null | grep -q 400 && echo '(✅ Available)' || echo '(❌ Not responding)')"
		echo "📊 Table Service: http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE) $$(curl -s -o /dev/null -w '%{http_code}' http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE) 2>/dev/null | grep -q 400 && echo '(✅ Available)' || echo '(❌ Not responding)')"
	else
		echo "❌ Status: NOT RUNNING"
		echo "💡 Start with: make storage-start"
	fi

storage-test: storage-test-blob storage-test-queue storage-test-table ## 🧪 Run comprehensive curl tests for all storage services
	@echo ""
	@echo "✅ All Azure Storage Emulator tests completed!"
	@echo "💡 Check the output above for any failures"

storage-test-blob: ## 🧪 Test Blob Storage service with curl
	@echo ""
	@echo "🧪 Testing Blob Storage Service..."
	@echo "=================================="
	@if ! pgrep -f "azurite" > /dev/null; then
		echo "❌ Azurite is not running. Start it with 'make storage-start'"
		exit 1
	fi
	@echo "📋 Testing Blob Service endpoints:"
	@echo ""
	@echo "1️⃣  Basic connectivity test:"
	@curl -s -w "Status: %{http_code}\n" -o /dev/null "http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB)/$(AZURITE_ACCOUNT)"
	@echo ""
	@echo "2️⃣  Connection string for your app:"
	@echo "AccountName=$(AZURITE_ACCOUNT);AccountKey=$(AZURITE_KEY);DefaultEndpointsProtocol=http;BlobEndpoint=http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB)/$(AZURITE_ACCOUNT);QueueEndpoint=http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE)/$(AZURITE_ACCOUNT);TableEndpoint=http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE)/$(AZURITE_ACCOUNT);"
	@echo ""
	@echo "3️⃣  Test with Azure CLI (if installed):"
	@echo "az storage container list --connection-string 'AccountName=$(AZURITE_ACCOUNT);AccountKey=$(AZURITE_KEY);DefaultEndpointsProtocol=http;BlobEndpoint=http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB)/$(AZURITE_ACCOUNT);'"
	@echo ""
	@echo "4️⃣  Test blob endpoint directly:"
	@curl -s -I "http://$(AZURITE_HOST):$(AZURITE_PORT_BLOB)/$(AZURITE_ACCOUNT)" | head -3
	@echo ""
	@echo "✅ Blob Storage tests completed!"

storage-test-queue: ## 🧪 Test Queue Storage service with curl
	@echo ""
	@echo "🧪 Testing Queue Storage Service..."
	@echo "==================================="
	@if ! pgrep -f "azurite" > /dev/null; then
		echo "❌ Azurite is not running. Start it with 'make storage-start'"
		exit 1
	fi
	@echo "📋 Testing Queue Service endpoints:"
	@echo ""
	@echo "1️⃣  Basic connectivity test:"
	@curl -s -w "Status: %{http_code}\n" -o /dev/null "http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE)/$(AZURITE_ACCOUNT)"
	@echo ""
	@echo "2️⃣  Queue endpoint test:"
	@curl -s -I "http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE)/$(AZURITE_ACCOUNT)" | head -3
	@echo ""
	@echo "3️⃣  Test with Azure CLI (if installed):"
	@echo "az storage queue list --connection-string 'AccountName=$(AZURITE_ACCOUNT);AccountKey=$(AZURITE_KEY);DefaultEndpointsProtocol=http;QueueEndpoint=http://$(AZURITE_HOST):$(AZURITE_PORT_QUEUE)/$(AZURITE_ACCOUNT);'"
	@echo ""
	@echo "✅ Queue Storage tests completed!"

storage-test-table: ## 🧪 Test Table Storage service with curl
	@echo ""
	@echo "🧪 Testing Table Storage Service..."
	@echo "==================================="
	@if ! pgrep -f "azurite" > /dev/null; then
		echo "❌ Azurite is not running. Start it with 'make storage-start'"
		exit 1
	fi
	@echo "📋 Testing Table Service endpoints:"
	@echo ""
	@echo "1️⃣  Basic connectivity test:"
	@curl -s -w "Status: %{http_code}\n" -o /dev/null "http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE)/$(AZURITE_ACCOUNT)"
	@echo ""
	@echo "2️⃣  Table endpoint test:"
	@curl -s -I "http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE)/$(AZURITE_ACCOUNT)" | head -3
	@echo ""
	@echo "3️⃣  Test with Azure CLI (if installed):"
	@echo "az storage table list --connection-string 'AccountName=$(AZURITE_ACCOUNT);AccountKey=$(AZURITE_KEY);DefaultEndpointsProtocol=http;TableEndpoint=http://$(AZURITE_HOST):$(AZURITE_PORT_TABLE)/$(AZURITE_ACCOUNT);'"
	@echo ""
	@echo "✅ Table Storage tests completed!"

