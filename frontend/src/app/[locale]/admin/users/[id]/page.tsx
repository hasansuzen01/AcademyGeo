import { setRequestLocale } from 'next-intl/server';

import { UserDetail } from '@/components/admin/user-detail';

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <UserDetail id={id} />;
}
