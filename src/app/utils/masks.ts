export interface Mask {
  format(value: string): string;
  parse(text: string): string;
  readonly length: number;
}

function createMask(template: string, prefix = ''): Mask {
  const slots = [...template].filter((char) => char === '#').length;
  const head = prefix === '' ? '' : template.slice(0, template.indexOf('#'));
  const body = prefix === '' ? template : template.slice(template.indexOf('#'));

  return {
    length: prefix.length + slots,

    format(value) {
      const digits = value.startsWith(prefix) ? value.slice(prefix.length) : value;
      if (digits === '') return '';
      let out = head;
      let used = 0;
      for (const char of body) {
        if (used === digits.length) break;
        if (char === '#') out += digits[used++];
        else out += char;
      }
      return out;
    },

    parse(text) {
      let digits = text.replace(/\D/g, '');
      if (prefix !== '') {
        const typedPrefix = head.replace(/\D/g, '');
        if (digits.startsWith(typedPrefix)) digits = digits.slice(typedPrefix.length);
        else if (digits.length > slots) digits = digits.slice(digits.length - slots);
      }
      digits = digits.slice(0, slots);
      return digits === '' ? '' : prefix + digits;
    },
  };
}

export const MASKS = {
  phone: createMask('+7 (###) ###-##-##', '7'),
  snils: createMask('###-###-### ##'),
  inn: createMask('############'),
  passportSeries: createMask('## ##'),
  passportNumber: createMask('######'),
  departmentCode: createMask('###-###'),
  postalCode: createMask('######'),
  seriesNumber: createMask('## ## ######'),
} satisfies Record<string, Mask>;

export type MaskName = keyof typeof MASKS;

export function isMaskComplete(name: MaskName, value: string): boolean {
  const mask = MASKS[name];
  return (
    value.length === mask.length && /^\d+$/.test(value) && mask.parse(mask.format(value)) === value
  );
}

export function formatMasked(name: MaskName, value: string | null): string {
  if (value === null) return '';
  return isMaskComplete(name, value) ? MASKS[name].format(value) : value;
}
