import { createFileRoute } from '@tanstack/react-router';
import UnauthorisedError from '#components/errors/unauthorized-error.tsx';

export const Route = createFileRoute('/(errors)/401')({
  component: UnauthorisedError,
});
