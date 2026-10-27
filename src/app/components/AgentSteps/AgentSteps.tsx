import cn from 'classnames';

import { Icon } from 'components/Icon';
import { Text } from 'components/Text';
import type { AgentStep } from 'types/models';

import styles from './AgentSteps.module.scss';

export interface AgentStepsProps {
  steps: readonly AgentStep[];

  live?: boolean;
  className?: string;
}

const RETRY_PREFIX = 'Повторный поиск: ';

export function AgentSteps({ steps, live = true, className }: AgentStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div
      role="log"
      aria-label="Шаги агента"

      aria-live={live ? undefined : 'off'}
      className={cn(styles.root, className)}
    >
      <ol className={styles.list} role="list">
        {steps.map((step) => {
          const active = step.status === 'active';
          const pending = step.status === 'pending';
          const retry = step.kind === 'retry';

          return (
            <li
              key={step.id}
              className={cn(
                styles.step,
                active && styles.current,
                pending && styles.pending,
                retry && styles.retry
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span className={styles.marker}>
                <Icon
                  name={active ? 'loader' : pending ? 'minus' : retry ? 'refresh' : 'check'}
                  size="sm"
                />
              </span>
              <Text
                as="span"
                size="sm"
                color={active ? 'primary' : pending ? 'tertiary' : 'secondary'}
                weight={active ? 'medium' : 'regular'}
                wrap="normal"
                className={styles.title}
              >
                {retry && <span className={styles.srOnly}>{RETRY_PREFIX}</span>}
                {step.title}
              </Text>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
