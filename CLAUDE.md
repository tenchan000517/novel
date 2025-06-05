# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (Next.js on port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

### Testing Commands
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:all` - Run all tests (Jest + Playwright)

Always run `npm run lint` and `npm run test` before committing changes.

## Project Architecture

This is an AI-powered novel automation system built with Next.js that generates high-quality novels using Google's Gemini API. The system maintains consistency through a sophisticated 3-tier memory architecture and comprehensive character management.

### Core System Components

#### 1. Memory System (3-Tier Hierarchy)
Located in `src/lib/memory/`:

- **Short-Term Memory** (`short-term/`) - Recent chapters, generation cache, immediate context (72 hours max)
- **Mid-Term Memory** (`mid-term/`) - Analysis results, character evolution, narrative progression, quality metrics
- **Long-Term Memory** (`long-term/`) - Character database, world knowledge, system knowledge, foreshadowing tracking
- **Unified Memory Manager** (`core/memory-manager.ts`) - Coordinates all tiers, provides unified search, manages cache coordination

#### 2. Character Management System
Located in `src/lib/characters/`:

- **Character Service** - CRUD operations, state management
- **Detection Service** - Finds characters in generated content
- **Evolution Service** - Manages character development and growth plans
- **Psychology Service** - Analyzes character behavior and psychology
- **Relationship Service** - Manages inter-character relationships
- **Parameter & Skill Services** - Tracks character attributes and abilities

Main interface: `ICharacterManager` provides unified access to all character operations.

#### 3. Story Generation Pipeline
Located in `src/lib/generation/`:

- **NovelGenerationEngine** (`engine.ts`) - Main orchestrator
- **PromptGenerator** (`prompt-generator.ts`) - Creates AI prompts using memory context
- **GeminiClient** (`gemini-client.ts`) - Interface to Google's Gemini AI
- **ChapterGenerator** (`engine/chapter-generator.ts`) - Generates individual chapters

#### 4. Service Container Architecture
Located in `src/lib/lifecycle/service-container.ts`:

5-stage initialization pattern:
1. Infrastructure Services
2. Storage Services (includes WorldSettingsManager)
3. Memory System (MemoryManager)
4. Core Services (Parameters, AI clients)
5. Facade Services (CharacterManager, PlotManager, GenerationEngine)

### API Structure

#### Admin Routes (`src/app/(admin)/`)
- `/admin/dashboard` - System overview and metrics
- `/admin/characters` - Character management interface
- `/admin/editor` - Content editing and intervention tools
- `/admin/memory` - Memory system management
- `/admin/analytics` - Quality analysis and charts

#### Public Routes (`src/app/(public)/`)
- `/` - Main story page
- `/chapters/[id]` - Individual chapter viewing

#### API Routes (`src/app/api/`)
- `/api/generation/chapter` - Generate new chapters
- `/api/generation/test-prompt` - Test prompt generation

### Data Storage Structure

#### Configuration Files (`data/config/`)
- `story-plot.yaml` - Main plot configuration
- `world-settings.yaml` - World and setting definitions
- `theme-tracker.yaml` - Theme tracking configuration
- `system-parameters.json` - System-wide parameters

#### Character Data (`data/characters/`)
- `main/` - Main character definitions (YAML)
- `sub/` - Supporting character definitions
- `relationships/` - Character relationship mappings
- `states/` - Current character states

#### Memory Data (`data/`)
- `short-term/` - Recent context and generation cache
- `mid-term-memory/` - Analysis and progression data
- `long-term-memory/` - Persistent knowledge and character records

### Key Design Patterns

- **Repository Pattern** - Data access abstraction for characters, relationships
- **Service Layer** - Business logic separation from data access
- **Facade Pattern** - CharacterManager provides simplified interface to complex subsystems
- **Event Bus** - Decoupled communication between components
- **Strategy Pattern** - Different memory access and generation strategies

### Working with the System

#### Adding New Features
1. Understand which memory tier your feature affects
2. Check if character system integration is needed
3. Consider impact on generation pipeline
4. Update relevant interfaces in `src/types/`

#### Memory System Integration
- Use `MemoryManager` for cross-tier operations
- Short-term for immediate context (< 72 hours)
- Mid-term for analysis and metrics
- Long-term for permanent knowledge

#### Character System Integration
- Use `CharacterManager.getInstance()` for character operations
- Always update character states after significant events
- Use `DetectionService` to find characters in generated content

#### Generation Pipeline
- Context building happens automatically via `ContextGenerator`
- Prompts combine world settings, characters, plot, and memory
- Post-processing includes analysis, character updates, and memory storage

### Environment Setup

Required environment variables (create `.env.local`):
- `GOOGLE_AI_API_KEY` - Gemini API key for story generation
- Node.js v18.x+ and npm v9.x+ required

### Data Configuration

The system requires extensive YAML/JSON configuration files in the `data/` directory. See the comprehensive configuration examples in the README.md for required file formats and structures.