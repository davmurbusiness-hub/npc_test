export type ClaimKind = 'fact' | 'bank_view' | 'ai_conclusion';

export type SourceOrigin = 'news' | 'alfa_analytics' | 'company_data';

export interface Source {
  id: string;
  title: string;

  url: string | null;
  origin: SourceOrigin;

  synthetic: boolean;
}

export type ClaimEffect = 'risk' | 'opportunity';

export interface Claim {
  id: string;
  kind: ClaimKind;
  text: string;
  sources: Source[];

  unsourced: boolean;

  effect: ClaimEffect | null;

  title?: string | null;

  scope?: 'company' | 'group' | null;

  productName?: string | null;
}

export type AnswerSectionKind =
  'what_happened' | 'why_it_matters' | 'consequences' | 'bank_view' | 'actions' | 'basis';

export type ClaimSectionKind = Exclude<AnswerSectionKind, 'basis'>;

export interface ClaimSection {
  kind: ClaimSectionKind;
  claims: Claim[];
}

export interface BasisSection {
  kind: 'basis';

  profileFields: string[];

  sources: Source[];

  theses: string[];
}

export type AnswerSection = ClaimSection | BasisSection;

export type TableCell = string | number | null;

export interface TableBlock {
  type: 'table';
  id: string;
  title: string;
  columns: string[];
  rows: TableCell[][];
}

export type ChartKind = 'bar' | 'line';

export interface ChartSeries {
  name: string;

  values: (number | null)[];
}

export interface ChartBlock {
  type: 'chart';
  id: string;
  title: string;
  chartKind: ChartKind;
  categories: string[];
  series: ChartSeries[];
}

export interface UnsupportedBlock {
  type: 'unsupported';
  id: string;
  title: string | null;
}

export type AnswerBlock = TableBlock | ChartBlock | UnsupportedBlock;

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Confidence {
  level: ConfidenceLevel;

  score: number | null;
}

export interface ProductOffer {
  productName: string;

  reason: string;
}

export interface Answer {
  id: string;
  sections: AnswerSection[];
  blocks: AnswerBlock[];

  sources: Source[];
  confidence: Confidence;

  limitations: string[];
  offer: ProductOffer | null;

  revisedBySelfCheck: boolean;

  offTopicReply?: string | null;

  subject?: 'company' | 'group' | 'company_and_group';
}

export type AgentStepKind = 'plan' | 'tool' | 'context' | 'self_check' | 'retry';

export type AgentStepStatus = 'pending' | 'active' | 'done';

export interface AgentStep {
  id: string;
  kind: AgentStepKind;

  status: AgentStepStatus;

  title: string;
}

export type MessageStatus = 'streaming' | 'done' | 'stopped' | 'error';

export type ChatErrorKind =
  | 'stream_failed'
  | 'llm_unavailable'
  | 'budget_exhausted'
  | 'rate_limited';

export interface UserChatMessage {
  id: string;
  role: 'user';
  text: string;
}

export interface AssistantChatMessage {
  id: string;
  role: 'assistant';
  status: MessageStatus;
  steps: AgentStep[];
  traceId?: string;
  answer?: Answer;
  error?: ChatErrorKind;
}

export interface AdviceStep {
  id: string;
  title: string;

  details: string[];
  horizon: string | null;
}

export interface AdviceScenario {
  id: string;
  name: string;
  description: string;
  trigger: string | null;
}

export interface Advice {
  id: string;

  insightId: string;
  plan: AdviceStep[];
  scenarios: AdviceScenario[];
  questionsForTeam: string[];

  offer: ProductOffer | null;

  disclaimers: string[];
}

export interface AdviceChatMessage {
  id: string;
  role: 'advice';
  status: MessageStatus;
  steps: AgentStep[];
  traceId?: string;
  advice?: Advice;
  error?: ChatErrorKind;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage | AdviceChatMessage;

export type QuickActionKind = 'clarify' | 'other_cut' | 'primary_source' | 'next_step';

export type LaunchSource = 'menu' | 'home' | 'notification' | 'prompt' | 'feed';

export type ChatRequest =
  | { kind: 'event'; eventId: string; title: string }
  | { kind: 'question'; text: string; eventId: string | null; insightId: string | null }
  | { kind: 'advice'; insightId: string };

export interface Chat {
  id: string;

  title: string;
  scope: AnalyticsScope;
  companyId: string;

  eventId: string | null;
  eventTitle: string | null;

  synthetic: boolean;

  material: string | null;

  candidates: FeedItem[];
  messages: ChatMessage[];

  requests: Record<string, ChatRequest>;

  feedback: Record<string, Feedback>;

  draft: string;

  streamingId: string | null;

  updatedAt: string;
}

export interface ChatIndexEntry {
  id: string;
  title: string;
  userId: string;
  companyId: string;
  scope: AnalyticsScope;

  updatedAt: string;
}

export interface ChatHistory {
  messages: ChatMessage[];

  requests?: Record<string, ChatRequest>;
  eventId: string | null;
  eventTitle: string | null;
  synthetic: boolean;

  feedback: Record<string, Feedback>;

  companyId?: string | null;

  scope?: AnalyticsScope | null;
}

export type FeedbackValue = 'up' | 'down';

export type FeedbackReason = 'off_topic' | 'factual_error' | 'too_general' | 'other';

export interface Feedback {
  value: FeedbackValue;
  reason: FeedbackReason | null;
}

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  sources: Source[];
  synthetic: boolean;

  publishedAt?: string;

  isNew?: boolean;

  analysis?: FeedAnalysis;
}

export interface FeedAnalysis {
  chatId: string | null;

  analyzedAt: string;
}

export interface ChatSummary {
  id: string;
  title: string;

  updatedAt: string;
}

export interface SavedPrompt {
  id: number;
  title: string;
  text: string;

  createdAt: string;

  updatedAt: string;
}

export interface SavedPromptInput {
  title: string;
  text: string;
}

export type NotificationKind = 'alfa_analytics' | 'company_event' | 'bank';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  text: string;

  targetId: string | null;

  prompt: string | null;

  createdAt: string | null;
}

export interface NotificationsFeed {
  unread: number;
  items: NotificationItem[];
}

export type BankProduct =
  'rko' | 'guarantees' | 'credits' | 'leasing' | 'deposits' | 'salary_project' | 'factoring';

export interface CompanyGroupScale {
  totalRevenue: number | null;
  regions: string[];
  industries: string[];
}

export interface IndustryRank {
  place: number;
  of: number;
}

export interface CompanyEstimates {
  industryPercentile: number | null;

  industryRank: IndustryRank | null;

  creditLoad: string[] | null;
  groupScale: CompanyGroupScale | null;
}

export interface CompanyLinks {
  counterparties: number | null;
  persons: number | null;
  groupCompanies: number | null;
}

export interface CompanyProfile {
  label: string;

  ageGradation: string | null;

  developmentStage: string | null;

  okvedCode: string | null;

  okvedName: string | null;

  orgType: string | null;

  ownershipForm: string | null;

  groupId: string | null;

  workersFns: string | null;

  workersSpark: string | null;

  revenue: number | null;

  clientType: string | null;

  products: Record<BankProduct, boolean | null>;

  foreignTrade: boolean | null;

  foreignTradeCountries: string[] | null;
  city: string | null;
  region: string | null;
  links: CompanyLinks;
  estimates: CompanyEstimates;
}

export interface CompanyPayments {
  incoming: number;
  outgoing: number;
  balance: number;
  counterparties: number;
  operations: number;
}

export interface GroupPayments {
  internal: number;
  incoming: number;
  outgoing: number;
  balance: number;

  note: string | null;
}

export interface GroupMember {
  id: string;
  okvedName: string | null;
  region: string | null;
  city: string | null;

  revenue: number | null;
}

export interface CompanyGroup {
  id: string;

  revenue: number | null;
  regions: string[];

  sectors: string[];
  payments: GroupPayments;
  members: GroupMember[];
}

export interface GroupMemberRow extends GroupMember {
  current: boolean;

  canSwitch: boolean;
}

export interface CompanyGroupBrief {
  id: string;
  members: number;

  revenue: number | null;
}

export interface CompanyOverview {
  profile: CompanyProfile;
  payments: CompanyPayments;
  group: CompanyGroupBrief | null;
}

export interface CounterpartyProfile {
  okvedName: string | null;
  region: string | null;
  foreignTrade: boolean | null;
}

export interface CounterpartyStat {
  id: string;

  label: string;
  incoming: number;
  outgoing: number;

  turnover: number;

  balance: number;

  operations: number;

  averageTransfer: number | null;

  share: number;

  profile: CounterpartyProfile | null;
}

export type CounterpartyTopCut = 'turnover' | 'incoming' | 'outgoing' | 'share';

export interface PaymentsSummary {
  turnover: number;
  incoming: number;
  outgoing: number;
  operations: number;
}

export interface Concentration {
  threshold: number;

  share: number;
  items: CounterpartyStat[];
}

export type CounterpartyDirection = 'suppliers' | 'customers';

export interface CounterpartyShares {
  direction: CounterpartyDirection;
  top1: number;
  top3: number;

  counterparties: number;
}

export type AnalyticsScope = 'company' | 'group';

export type Async<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

export type Block<P> = Async<P> & { onRetry: () => void };

export type FunnelEventName =
  | 'entry_block_shown'
  | 'entry_block_clicked'
  | 'chat_opened'
  | 'insight_opened'
  | 'prompt_sent'
  | 'followup_prompt_sent'
  | 'saved_prompt_used'
  | 'source_opened'
  | 'advice_requested'
  | 'feedback_given'
  | 'notification_opened';

export interface TrackInput {
  event: FunnelEventName;

  props?: Record<string, string | number | boolean>;
}

export type TransactionScope = 'company' | 'group';

export type FlowKind = 'incoming' | 'outgoing' | 'internal';

export type FlowFilter = 'all' | FlowKind;

export interface ScopeSubject {
  scope: TransactionScope;
  id: string;
}

export interface FlowPair {
  payerId: string;
  beneficiaryId: string;
  kind: FlowKind;

  amount: number;
  operations: number;

  average: number | null;
}

export interface FlowPairPage {
  items: readonly FlowPair[];

  count: number;
  totalAmount: number;
  totalOperations: number;
}

export interface CounterpartyFlow {
  id: string;
  amount: number;
  operations: number;

  share: number;

  known: boolean;

  sectorName: string | null;
  region: string | null;
}

export interface CounterpartyFlowList {
  direction: CounterpartyDirection;

  total: number;

  totalAmount: number;

  top1: number;
  top3: number;
  items: readonly CounterpartyFlow[];
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export type LoginErrorKind = 'invalid_credentials' | 'rate_limited' | 'unavailable';

export type AccessRole = 'client' | 'analyst' | 'admin';

export interface Session {
  token: string;

  accessExpiresAt: number;

  refreshToken: string;
  userId: string;

  companyId: string;

  companies: string[];

  role: string;
  accessRole: AccessRole;
}

export interface UserCompany {
  id: string;
  okvedName: string | null;

  region: string | null;
  city: string | null;
  groupId: string | null;
}

export interface JobRoleInfo {
  code: string;
  label: string;

  focus: string;

  factors: string[];
}

export interface Me {
  login: string;

  fullName: string | null;

  avatarUrl: string | undefined;
}

export type FullNameErrorKind = 'too_long' | 'invalid_chars' | 'rate_limited' | 'failed';

export type AvatarErrorKind =
  'too_large' | 'unsupported' | 'invalid_image' | 'rate_limited' | 'failed';
