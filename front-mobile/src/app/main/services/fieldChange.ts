interface Pending {
  token: string;
  newValue: string;
  expires: number;
}
const pending: Record<string, { email?: Pending; phone?: Pending }> = {};
const lastChange: Record<string, { email: number; phone: number }> = {};
const now = () => Date.now();
const randomOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const THROTTLE_MS = 60 * 24 * 60 * 60 * 1000;

export const requestFieldChange = async (
  userEmail: string,
  field: "email" | "phone",
  newValue: string
): Promise<{ ok: boolean; message?: string }> => {
  const last = lastChange[userEmail]?.[field] ?? 0;
  if (now() - last < THROTTLE_MS) {
    const daysLeft = Math.ceil((THROTTLE_MS - (now() - last)) / 86_400_000);
    return {
      ok: false,
      message: `You can change your ${field} again in ${daysLeft} day(s).`,
    };
  }

  const token = randomOTP();
  pending[userEmail] = pending[userEmail] || {};
  pending[userEmail][field] = {
    token,
    newValue,
    expires: now() + 10 * 60 * 1000,
  };
  console.log(`📡  [fake] sent OTP ${token} for ${field} change → ${newValue}`);

  return { ok: true };
};

export const verifyFieldChange = async (
  userEmail: string,
  field: "email" | "phone",
  token: string
): Promise<{ ok: boolean; newValue?: string }> => {
  const p = pending[userEmail]?.[field];
  if (!p || p.expires < now() || p.token !== token) {
    return { ok: false };
  }
  delete pending[userEmail][field];
  lastChange[userEmail] = lastChange[userEmail] || { email: 0, phone: 0 };
  lastChange[userEmail][field] = now();
  console.log(`✅  [fake] ${field} verified for ${userEmail} → ${p.newValue}`);
  return { ok: true, newValue: p.newValue };
};

export const updateAccountField = (
  userEmail: string,
  field: "email" | "phone",
  newValue: string
): Promise<void> =>
  new Promise((resolve) => {
    console.log(`📡  [fake] stored ${field}=${newValue} for ${userEmail}`);
    setTimeout(resolve, 300);
  });

export const requestAccountClosure = (email: string): Promise<void> =>
  new Promise((resolve) => {
    console.log(`📡  delete-account request for ${email}`);
    setTimeout(resolve, 800);
  });
