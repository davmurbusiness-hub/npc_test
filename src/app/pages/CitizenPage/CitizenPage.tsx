import { useParams } from 'react-router';

import { CitizenPageContent } from './CitizenPageContent';

export function CitizenPage() {
  const { id = '' } = useParams();
  return <CitizenPageContent key={id} id={id} />;
}
