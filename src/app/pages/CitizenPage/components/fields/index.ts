import {
  FileField,
  MultiSelectField,
  SearchSelectField,
  SelectField,
  SwitchField,
} from './choiceFields';
import { DateField, MaskedField, NumberField, TextareaField, TextField } from './textFields';

export { FieldGrid, ViewPair } from './FieldGrid';
export { DeadlineBadge } from './textFields';
export { FormScopeContext, useFormScope } from './useBoundField';
export type { FormScopeValue } from './useBoundField';

export function fieldsOf<T>() {
  return {
    Text: TextField<T>,
    Textarea: TextareaField<T>,
    Masked: MaskedField<T>,
    Date: DateField<T>,
    Number: NumberField<T>,
    Select: SelectField<T>,
    SearchSelect: SearchSelectField<T>,
    MultiSelect: MultiSelectField<T>,
    Switch: SwitchField<T>,
    File: FileField<T>,
  };
}
