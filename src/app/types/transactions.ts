import type { Async, Block, CounterpartyProfile, TransactionScope } from './models';

export interface PartyRef {
  id: string;
  label: string;

  title: string | null;
}

export interface ButterflyRow {
  id: string;
  label: string;

  title: string | null;
  left: number | null;
  right: number | null;
}

export interface KpiTile {
  id: string;
  label: string;

  value: number | null;
  format: 'money' | 'count';

  signed: boolean;

  hint: string | null;
}

export interface ConcentrationSeries {
  id: 'incoming' | 'outgoing';
  label: string;
  points: readonly number[];

  top1: number | null;
  top3: number | null;
}

export interface MemberDrawerData {
  member: PartyRef;
  externalIncoming: number | null;
  externalOutgoing: number | null;
  internalSent: number | null;
  internalReceived: number | null;
  estimated: boolean;
}

export type TransactionsScopeControl =
  | { status: 'hidden' }
  | { status: 'loading' }
  | { status: 'ready'; value: TransactionScope; onChange: (scope: TransactionScope) => void };

export interface TransactionsHeaderProps {
  subtitle: string | null;
  scope: TransactionsScopeControl;
  className?: string;
}

export interface KpiTilesProps {
  tiles: readonly KpiTile[];
  className?: string;
}

export interface CounterpartyFlowsProps {
  rows: readonly ButterflyRow[];

  note: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export interface ConcentrationCurveProps {
  series: readonly ConcentrationSeries[];
  note: string | null;
  className?: string;
}

export interface InternalMatrixProps {
  members: readonly PartyRef[];

  cells: Readonly<Record<string, Readonly<Record<string, number>>>>;
  maxCell: number;
  activeId?: string | null;
  onSelect: (id: string) => void;

  note: string | null;
  className?: string;
}

export interface MemberContributionProps {
  rows: readonly ButterflyRow[];
  activeId?: string | null;
  note: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export interface MemberDrawerProps {
  open: boolean;

  data: MemberDrawerData | null;
  onClose: () => void;
  className?: string;
}

export type CounterpartyRole = 'customer' | 'supplier' | 'both';

export type DirectionFact =
  | {
      kind: 'present';
      amount: number;
      operations: number;
      average: number | null;

      share: number;

      rank: number;

      total: number;
    }
  | { kind: 'none' }
  | { kind: 'unknown' };

export interface CounterpartyModalView {
  id: string;

  role: CounterpartyRole | null;

  known: boolean | null;

  incoming: DirectionFact;

  outgoing: DirectionFact;

  turnover: number | null;

  balance: number | null;

  turnoverShare: number | null;

  verdicts: readonly string[];

  partial: boolean;

  profile: CounterpartyProfile | null;
}

export interface CounterpartyModalProps {
  open: boolean;

  party: PartyRef | null;
  onClose: () => void;

  state: Async<CounterpartyModalView | null>;
  onRetry: () => void;
  onAskAi: (view: CounterpartyModalView) => void;
  className?: string;
}

export type TransactionsLayout = 'company' | 'group' | 'empty';

export interface TransactionsModel {
  layout: TransactionsLayout;
  header: TransactionsHeaderProps;

  notice: string | null;
  kpi: Block<KpiTilesProps>;

  parties: Block<CounterpartyFlowsProps>;
  concentration: Block<ConcentrationCurveProps>;

  matrix: Block<InternalMatrixProps>;
  members: Block<MemberContributionProps>;
  memberDrawer: MemberDrawerProps;

  counterpartyModal: CounterpartyModalProps;
}
