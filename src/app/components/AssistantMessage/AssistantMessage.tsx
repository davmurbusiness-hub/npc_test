import cn from 'classnames';

import { AgentSteps } from 'components/AgentSteps';
import { Alert } from 'components/Alert';
import { AnswerView } from 'components/AnswerView';
import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { FeedbackBar } from 'components/FeedbackBar';
import { QuickActions } from 'components/QuickActions';
import type {
  AssistantChatMessage,
  ChatErrorKind,
  Feedback,
  MessageStatus,
  QuickActionKind,
} from 'types/models';
import { pickOwn } from 'utils/pickOwn';

import styles from './AssistantMessage.module.scss';
import { chatErrorView } from './chatErrorView';

import type { ReactNode } from 'react';

export interface AssistantMessageProps {
  message: AssistantChatMessage;

  feedback: Feedback | null;
  onFeedback: (next: Feedback) => void;
  onStop: () => void;
  onRetry: () => void;
  onQuickAction: (kind: QuickActionKind) => void;

  actionsDisabled?: boolean;

  quickActions?: boolean;

  disabledQuickActions?: readonly QuickActionKind[];

  sourcesId?: string;

  stepsLive?: boolean;
  className?: string;
}

const NO_KINDS: readonly QuickActionKind[] = [];

function isFeedbackSent(feedback: Feedback | null): boolean {
  return feedback !== null && (feedback.value === 'up' || feedback.reason !== null);
}

interface RetryButtonProps {
  actionsDisabled: boolean;
  onRetry: () => void;
  className?: string;
}

function RetryButton({ actionsDisabled, onRetry, className }: RetryButtonProps) {
  return (
    <Button
      className={className}
      variant="secondary"
      size="sm"
      icon="refresh"
      disabled={actionsDisabled}
      onClick={() => {
        onRetry();
      }}
    >
      Повторить
    </Button>
  );
}

interface ErrorAlertProps {
  kind: ChatErrorKind | undefined;
  actionsDisabled: boolean;
  onRetry: () => void;
}

function ErrorAlert({ kind, actionsDisabled, onRetry }: ErrorAlertProps) {
  const { title, text, retry } = chatErrorView(kind);

  return (
    <Alert
      tone="negative"
      title={title}
      action={retry ? <RetryButton actionsDisabled={actionsDisabled} onRetry={onRetry} /> : null}
    >
      {text}
    </Alert>
  );
}

type BodyContext = Required<Omit<AssistantMessageProps, 'className' | 'sourcesId' | 'stepsLive'>> &
  Pick<AssistantMessageProps, 'sourcesId'>;

function renderStreaming({ onStop }: BodyContext): ReactNode {
  return (
    <Button
      className={styles.stop}
      variant="secondary"
      size="sm"
      icon="stop"
      onClick={() => {
        onStop();
      }}
    >
      Остановить
    </Button>
  );
}

function renderDone(context: BodyContext): ReactNode {
  const {
    message,
    feedback,
    actionsDisabled,
    quickActions,
    disabledQuickActions,
    sourcesId,
    onFeedback,
    onQuickAction,
    onRetry,
  } = context;
  const { answer } = message;

  if (!answer) {
    return <ErrorAlert kind="stream_failed" actionsDisabled={actionsDisabled} onRetry={onRetry} />;
  }

  return (
    <>
      <AnswerView answer={answer} sourcesId={sourcesId} />

      {quickActions && !answer.offTopicReply ? (
        <QuickActions
          onAction={onQuickAction}
          disabled={actionsDisabled}
          disabledKinds={disabledQuickActions}
        />
      ) : null}
      <div className={styles.footer}>
        <FeedbackBar value={feedback} onChange={onFeedback} locked={isFeedbackSent(feedback)} />
      </div>
    </>
  );
}

function renderStopped({ message, sourcesId, actionsDisabled, onRetry }: BodyContext): ReactNode {
  return (
    <>
      <Badge className={styles.stopped} tone="neutral">
        Остановлено
      </Badge>
      <RetryButton className={styles.retry} actionsDisabled={actionsDisabled} onRetry={onRetry} />
      {message.answer ? <AnswerView answer={message.answer} sourcesId={sourcesId} /> : null}
    </>
  );
}

function renderError({ message, sourcesId, actionsDisabled, onRetry }: BodyContext): ReactNode {
  return (
    <>
      {message.answer ? <AnswerView answer={message.answer} sourcesId={sourcesId} /> : null}
      <ErrorAlert kind={message.error} actionsDisabled={actionsDisabled} onRetry={onRetry} />
    </>
  );
}

const BODY = {
  streaming: renderStreaming,
  done: renderDone,
  stopped: renderStopped,
  error: renderError,
} satisfies Record<MessageStatus, (context: BodyContext) => ReactNode>;

export function AssistantMessage({
  className,
  actionsDisabled = false,
  quickActions = true,
  disabledQuickActions = NO_KINDS,
  stepsLive = true,
  ...props
}: AssistantMessageProps) {
  const { message } = props;
  const renderBody = pickOwn(BODY, message.status, BODY.error);

  return (
    <article className={cn(styles.root, className)} aria-label="Ответ ИИ-Аналитики">
      <AgentSteps steps={message.steps} live={stepsLive} />
      {renderBody({ ...props, actionsDisabled, quickActions, disabledQuickActions })}
    </article>
  );
}
