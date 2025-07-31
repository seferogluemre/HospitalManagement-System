import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthenticatedLayout } from '#/components/layout/authenticated-layout';
import { api } from '#lib/api.ts';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context;
    const session = await queryClient.ensureQueryData({
      queryKey: ['session'],
      queryFn: () => api.auth.me.get(),
    });
    if (!session.data) {
      throw redirect({ to: '/sign-in' });
    }
  },
  component: AuthenticatedLayout,
});
