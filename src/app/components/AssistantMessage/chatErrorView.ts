import type { ChatErrorKind } from 'types/models';
import { pickOwn } from 'utils/pickOwn';

export interface ChatErrorView {
  title: string;
  text: string;

  retry: boolean;
}

const ERROR_VIEW = {
  stream_failed: {
    title: 'Ответ прервался',
    text: 'Не удалось получить ответ полностью.',
    retry: true,
  },
  llm_unavailable: {
    title: 'ИИ-модель сейчас недоступна',
    text: 'Попробуйте повторить запрос через несколько минут.',
    retry: true,
  },

  budget_exhausted: {
    title: 'Дневной лимит запросов к ИИ исчерпан',
    text: 'Лимит обновится в 03:00 по Москве.',
    retry: false,
  },
  rate_limited: {
    title: 'Слишком частые запросы',
    text: 'Подождите минуту и повторите запрос.',
    retry: true,
  },
} satisfies Record<ChatErrorKind, ChatErrorView>;

const FALLBACK: ChatErrorView = ERROR_VIEW.stream_failed;

export function chatErrorView(kind: ChatErrorKind | undefined): Readonly<ChatErrorView> {
  return kind === undefined ? FALLBACK : pickOwn(ERROR_VIEW, kind, FALLBACK);
}
