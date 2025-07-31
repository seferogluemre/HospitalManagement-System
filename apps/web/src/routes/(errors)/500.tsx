import { createFileRoute } from '@tanstack/react-router';
import GeneralError from '#components/errors/general-error.tsx';

export const Route = createFileRoute('/(errors)/500')({
  component: GeneralError,
});
