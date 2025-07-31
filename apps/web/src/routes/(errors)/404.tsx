import { createFileRoute } from '@tanstack/react-router';
import NotFoundError from '#components/errors/not-found-error.tsx';

export const Route = createFileRoute('/(errors)/404')({
  component: NotFoundError,
});
