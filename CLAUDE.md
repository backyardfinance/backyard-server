# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Backyard Finance Server** is a NestJS backend API for a Solana DeFi application that manages investment vaults, strategies, and compressed NFT rewards. The server provides wallet-based authentication, multi-protocol vault integrations (Jupiter, Kamino), transaction building, and social verification features.

**Tech Stack:** NestJS 10.x, TypeScript 5.1, PostgreSQL 17, Prisma 6.17, Redis, Solana Web3.js, Metaplex, Passport.js

## Development Commands

### Initial Setup
```bash
yarn install
cp .env.example .env          # Configure environment variables
docker-compose up -d          # Start PostgreSQL + Redis
yarn prisma:migrate           # Run database migrations
yarn prisma:generate          # Generate Prisma client
```

### Development Workflow
```bash
yarn start:dev                # Start with hot-reload (port 4000)
yarn start:debug              # Start with debugger attached
```
- Swagger API docs: http://localhost:4000/api/docs
- Health check: http://localhost:4000/

### Database Management
```bash
yarn prisma:generate          # Regenerate Prisma client after schema changes
yarn prisma:migrate           # Create and run new migrations
yarn prisma:studio            # Open Prisma Studio GUI
```

### Testing
```bash
yarn test                     # Run unit tests
yarn test:watch               # Run tests in watch mode
yarn test:cov                 # Generate coverage report
yarn test:e2e                 # Run end-to-end tests
yarn test:debug               # Debug tests
```

### Code Quality
```bash
yarn lint                     # Run ESLint with auto-fix
yarn format                   # Format code with Prettier
```

### Production
```bash
yarn build                    # Compile TypeScript to dist/
yarn start:prod               # Run compiled application
yarn start:migrate:prod       # Run migrations + start production server
```

## Architecture

### Module Organization

The codebase follows NestJS modular architecture. Each feature module (`src/modules/*`) typically contains:
- `*.module.ts` - Dependency injection container
- `*.controller.ts` - HTTP endpoints with route decorators
- `*.service.ts` - Business logic and external integrations
- `dto/*.dto.ts` - Request/response validation schemas
- `guards/`, `strategies/`, `interfaces/` - Auth and type definitions

**Key Modules:**
- `auth/` - JWT + wallet signature authentication, Twitter OAuth
- `user/` - User management, email verification
- `vault/` - Multi-protocol vault management (Jupiter, Kamino)
- `strategy/` - User investment strategies and portfolio tracking
- `transaction/` - Protocol-agnostic transaction building
- `quote/` - Yield and swap quote aggregation
- `metaplex/` - Compressed NFT (cNFT) minting
- `solana/` - Blockchain RPC interactions
- `whitelist/` - Campaign and social verification

### Global Configuration

**Applied in `main.ts`:**
- `ValidationPipe` - Auto-validates DTOs, transforms types
- `ExceptionFilter` - Handles Prisma errors (unique constraints, foreign keys)
- `ThrottlerGuard` - Redis-backed rate limiting
- CORS configured for `FRONTEND_URL`
- Swagger documentation enabled at `/api/docs`

**Global Modules:**
- `ConfigModule` - Environment variables (`src/config/configuration.ts`)
- `PrismaModule` - Database client singleton
- `CacheModule` - Redis caching with `ioredis`

### Authentication Flow

**Wallet-based authentication (primary):**
1. Client requests nonce: `POST /auth/claim-nonce`
2. User signs nonce with Solana wallet (using `tweetnacl`)
3. Client sends signature: `POST /auth/verify-signature`
4. Server verifies signature using `siwe`, returns JWT access + refresh tokens
5. User record created/retrieved in database

**Twitter linking (secondary):**
- Requires existing JWT authentication
- OAuth 2.0 flow via Passport (`@superfaceai/passport-twitter-oauth2`)
- JWT stored in session cookie before redirect
- On callback, Twitter data (xId, xUsername) linked to authenticated user
- Used for social verification (follow/retweet checks)

**Route protection:**
- `@UseGuards(JwtAuthGuard)` - Require valid JWT
- `@UseGuards(TwitterAuthGuard)` - Require linked Twitter account
- `@Throttle()` - Apply rate limits (short/medium/long configs)

### Transaction Building Pattern

The `transaction/` module uses a **Builder Pattern** for protocol-agnostic transaction construction:

```typescript
interface ProtocolBuilder {
  getInstructions(params): Promise<TransactionInstruction[]>
}

class BuilderFactory {
  createBuilder(protocol: VaultPlatform): ProtocolBuilder
}
```

**Implementations:**
- `JupiterBuilder` - Jupiter swap + stake transactions
- `KaminoBuilder` - Kamino lending deposits

Controllers call `BuilderFactory` to get the appropriate builder based on vault platform, ensuring uniform transaction construction across protocols.

### Quote System Architecture

The `quote/` module uses an **Adapter Pattern** to normalize responses from different DeFi protocols:

- `JupiterQuoteAdapter` - Adapts Jupiter API responses
- Protocol-specific adapters transform various quote formats into consistent DTOs
- Quote service aggregates and caches results in Redis

### Database Schema (Prisma)

**Core Models:**
- `User` - Wallet address (primary key), email, Twitter (xId, xUsername)
- `Vault` - Investment vaults with platform enum (Jupiter | Kamino), token mints, current metrics (TVL, APY)
- `Strategy` - User investment strategies (name, description, user relation)
- `VaultStrategy` - Join table tracking user positions: deposited amounts (USD), interest earned, ownership fraction
- `VaultHistory` / `StrategyStatistics` - Time-series performance data
- `WhitelistParticipant` - Campaign tracking with social verification status

**Making schema changes:**
1. Edit `prisma/schema.prisma`
2. Run `yarn prisma:migrate` (creates migration + applies it)
3. Prisma Client regenerates automatically

### Caching Strategy

Redis caching via `@nestjs/cache-manager`:
- **Nonces** - Short TTL for wallet signature challenges
- **Quotes** - Medium TTL for yield/swap quotes
- **Rate limiting** - Throttler storage backend
- Use `@Inject(CACHE_MANAGER)` and `cache.get()`/`cache.set()`

### Error Handling

**Custom exception filter** (`src/common/utils/exception.filter.ts`):
- Extends `BaseExceptionFilter`
- Catches Prisma errors (P2002 unique constraint, P2003 foreign key)
- Maps to appropriate HTTP status codes

**In services/controllers:**
- Throw NestJS HTTP exceptions: `BadRequestException`, `UnauthorizedException`, `NotFoundException`
- Global filter formats consistent error responses

## Code Conventions

### File Naming
- Use kebab-case: `vault-history.service.ts`
- Standard suffixes: `.module.ts`, `.controller.ts`, `.service.ts`, `.dto.ts`, `.guard.ts`, `.strategy.ts`

### DTO Patterns
- All DTOs use `class-validator` decorators: `@IsString()`, `@IsNumber()`, `@IsOptional()`
- Add `@ApiProperty()` for Swagger documentation
- Enable auto-transformation in DTOs with `@Type()` when needed
- Group in module-specific `dto/` folders or global `src/dto/index.ts`

### Swagger Documentation
- Tag endpoints: `@ApiTags('vaults')`
- Document auth: `@ApiBearerAuth('JWT')`
- Response types: `@ApiOkResponse({ type: VaultDto })`
- Property descriptions: `@ApiProperty({ description: '...', example: ... })`

### Dependency Injection
- Use constructor injection for services
- Mark services with `@Injectable()`
- Import required modules in `@Module({ imports: [...] })`
- Export services for cross-module usage: `@Module({ exports: [ServiceName] })`

## Environment Configuration

Required variables (see `.env.example`):
```bash
ENV=local|dev|prod
NODE_ENV=development|production
PORT=4000
DATABASE_URL=postgresql://...
REDIS=redis://...
RPC_URL=                          # Solana RPC endpoint
MASTER_WALLET_PRIVATE_KEY=        # Server wallet for signing transactions

# Authentication
JWT_SECRET=                       # Strong random string
JWT_REFRESH_SECRET=               # Different from JWT_SECRET
SESSION_SECRET=                   # OAuth session encryption

# Frontend
FRONTEND_URL=                     # CORS origin

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=
RESEND_VERIFY_CODE_TEMPLATE_ID=

# Twitter OAuth
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=
TWITTER_SCRAPER_URL=              # Custom scraper service
TWITTER_SCRAPER_TOKEN=
TWITTER_TARGET_USERNAME=
TWITTER_TARGET_TWEET_ID=

# Features
IS_WHITELIST_ACTIVE=true|false
APP_TEST_MODE=false               # Enables /auth/test-login endpoint

# NFT Configuration
COLLECTION=                       # Metaplex collection address
MERKLE_TREE=                      # Compressed NFT merkle tree address
```

## Testing Approach

- **Unit tests**: Co-located `*.spec.ts` files in `src/`
- **E2E tests**: `test/*.e2e-spec.ts` with separate Jest config
- Mock Prisma client in tests using `jest.mock()`
- Test DTOs validate correctly with `class-validator`

## Important Notes

### External Service Dependencies
- **Solana RPC** - Blockchain reads/writes
- **Jupiter** - DEX aggregation and swaps
- **Kamino** - Lending protocol
- **Metaplex** - NFT infrastructure (cNFTs)
- **Resend** - Transactional emails
- **Twitter API** - OAuth and scraping
- **Redis** - Required for caching and rate limiting
- **PostgreSQL 17** - Primary database

### Rate Limiting
Three throttler configurations defined in `app.module.ts`:
- `short`: 5 requests per 5 minutes
- `medium`: 5 requests per 10 minutes
- `long`: 20 requests per 30 minutes

Apply per-endpoint with `@Throttle({ short: { limit: 5, ttl: 300000 } })`

### Docker Development
```bash
docker-compose up -d              # Starts Postgres + Redis
docker-compose down               # Stops containers
docker-compose logs -f            # View logs
```

**Services:**
- PostgreSQL on port 5432 (user: postgres, db: backyard_db)
- Redis on port 6379

### Solana Program IDLs
Anchor program IDLs stored in `src/common/idls/`:
- Used for transaction instruction building
- Keep synchronized with deployed program versions
