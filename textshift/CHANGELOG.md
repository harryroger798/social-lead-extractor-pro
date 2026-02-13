# Changelog

All notable changes to the TextShift platform.

## [1.0.0] - 2026-02-13

### Added
- **3-Mode Humanizer** (PR #66) - Academic, Professional, Casual mode selector with mode-specific T5 generation parameters and post-processing rules
- **SEO Improvements** (PR #67) - Sitemap expanded to 10 URLs, robots.txt cleaned, hreflang tags, Blog nav link, structured data fixes, Core Web Vitals reporting to GA4
- **CoEdIT-large Model Integration** (PR #68) - Grammar checker upgraded from t5-base (220M) to CoEdIT-large (770M params, instruction-tuned on 82K examples). Paraphraser and Content Improver switched from rule-based to CoEdIT-large
- **Grammar Tool UI** (PR #68) - Strikethrough diff preview, per-error Apply buttons, Insert error handling, arrow separator between original and replacement
- **Humanizer Spelling Pass** (PR #68) - Post-humanization spelling-only pass using LanguageTool TYPOS category
- **SageMaker Serverless** (PR #69) - 6 ML models migrated to AWS SageMaker Serverless as primary inference backend with local fallback
- **HuggingFace Inference API** (PR #70) - 3-tier inference: HF free API (primary) -> SageMaker (fallback) -> local models. In-memory LRU cache with 24h TTL
- **ONNX INT8 Quantization** (PR #71) - CoEdIT-large and Flan-T5-base converted to ONNX INT8 (75% smaller, 2-4x faster). Inference chain reordered: HF API -> ONNX local -> SageMaker
- **Auth0 Social Login** (PR #72) - Google, GitHub, Microsoft login via Auth0. Dual JWT validation (local + Auth0 RS256). User linking for existing accounts
- **4 Writing Tools Enhanced** (PR #73):
  - Tone Detector: tone categories, sentence-level breakdown, consistency score
  - Readability: paragraph-level Flesch scores, vocabulary richness, grade explanation
  - Word Counter: keyword density, reading/speaking time display, sentence stats
  - Style Analysis: formality score, POS distribution, transition words, passive voice examples
- **PDF Export** (PR #73) - Export to PDF using fpdf2, base64-encoded response, available for Starter+ tiers
- **CoEdIT Tone Adjuster** (PR #73) - Tone adjustment upgraded from rule-based to CoEdIT-large with 6 supported tones
- **API Docs Page Updated** (PR #73) - Response examples updated to match all new fields across 6 endpoints

### Performance
- Cold start: 80s -> 54s (32% faster)
- Warm run: 80s -> 28s (65% faster)
- Humanizer: 29s -> 3.4s (88% faster)
- Tone Detection: 1.5 -> 10.4 req/s throughput
- Translation: 1.2 -> 10.7 req/s throughput

### Infrastructure
- ONNX models deployed at `/opt/textshift/models/*-onnx/`
- fpdf2 added as backend dependency
- @auth0/auth0-spa-js added as frontend dependency
- react-helmet-async added for per-page SEO meta tags
- Service worker cache versioned (textshift-v8)

## [0.1.0] - 2026-01-15

### Added
- Initial platform launch
- AI Detection (RoBERTa-base)
- Humanizer (T5-base V3 + StealthWriter)
- Plagiarism Checker (SBERT + web search)
- 14 Writing Tools (basic implementations)
- User authentication (email/password)
- Subscription tiers (Free, Starter, Pro, Enterprise)
- Admin panel
- Credit system
- Scan history
