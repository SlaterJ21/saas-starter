import { cookies } from 'next/headers';

const CURRENT_ORG_COOKIE = 'current_org_id';

export async function getCurrentOrgId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(CURRENT_ORG_COOKIE)?.value || null;
}

export async function setCurrentOrgId(orgId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(CURRENT_ORG_COOKIE, orgId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
    });
}