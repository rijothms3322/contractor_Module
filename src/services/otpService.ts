import { supabase } from "@/lib/supabaseClient";

// TYPES == Codes returned by the verify-otp backend. Never hardcode on client.
export type OtpResponseCode =
  | "LOGIN_SUCCESS"
  | "PHONE_VERIFIED_SIGNUP_REQUIRED"
  | "OTP_INVALID"
  | "OTP_EXPIRED"
  | "INVALID_OTP_FORMAT"
  | "VERIFICATION_ID_REQUIRED"
  | "ACCOUNT_DELETED";

// Result handed to UI: backend code + optional backend message.
export interface VerifyOtpResult {
  code: OtpResponseCode | string;
  message?: string;

  registered?: boolean;

  phone?: string;
  verificationId?: string;

  signupToken?: string;
  token_hash?: string;

  user?: {
    id: string;
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    role?: string | null;
    isDeleted?: boolean;
  };
}





// Sends OTP; returns verificationId needed for verifyOtpAndLogin.
export async function sendVerificationOtp(
  phone: string,
  countryCode: string
): Promise<string> {
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanCountry = countryCode.replace(/\D/g, "");

  if (!cleanPhone || !cleanCountry) {
    throw new Error(
      "A valid phone number and country code are required input properties."
    );
  }

  console.log("[OTP] Sending OTP to:", `+${cleanCountry}${cleanPhone}`);

  const { data, error } = await supabase.functions.invoke("send-otp", {
    body: { phone: cleanPhone, countryCode: cleanCountry },
  });

  if (error) {
    console.error("[OTP] Send failed:", error);
    throw error;
  }

  if (data?.success && data?.verificationId) {
    console.log("[OTP] Sent verificationId:", data.verificationId);
    return data.verificationId;
  }

  console.error("[OTP] Invalid response:", data);
  throw new Error(
    "Gateway failed to return a valid verification session identifier."
  );
}

// Verifies OTP; returns backend code on rejection, creates session on success.
export async function verifyOtpAndLogin(
  phone: string,
  countryCode: string,
  verificationId: string,
  otpCode: string
): Promise<VerifyOtpResult> {
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanCountry = countryCode.replace(/\D/g, "");
  const cleanOtp = otpCode.replace(/\D/g, "");

  console.log(
    "[OTP] Verifying code for:",
    `+${cleanCountry}${cleanPhone}`
  );

  const { data, error } =
    await supabase.functions.invoke(
      "verify-otp",
      {
        body: {
          phone: cleanPhone,
          countryCode: cleanCountry,
          verificationId,
          otpCode: cleanOtp,
        },
      }
    );

  console.log(
    "[OTP] verify-otp response:",
    { data, error }
  );

  let payload: any = data;

  // ----------------------------------------------------------
  // Parse Edge Function error response
  // ----------------------------------------------------------

  if (error) {
    const ctx: any =
      (error as any).context;

    if (
      ctx &&
      typeof ctx.json === "function"
    ) {
      try {
        payload = await ctx.json();

        console.log(
          "[OTP] Parsed backend response:",
          payload
        );
      } catch (parseErr) {
        console.error(
          "[OTP] Failed to parse backend response:",
          parseErr
        );
      }
    }

    if (!payload) {
      throw new Error(
        error.message ||
        "Failed to verify OTP. Please try again."
      );
    }
  }

  // ----------------------------------------------------------
  // Backend response
  // ----------------------------------------------------------

  const code =
    payload?.code;

  const message =
    payload?.message ??
    payload?.error;

  if (!code) {
    throw new Error(
      message ||
      "Invalid response from server."
    );
  }

  // ----------------------------------------------------------
  // NEW USER
  // ----------------------------------------------------------

  if (
    code ===
    "PHONE_VERIFIED_SIGNUP_REQUIRED"
  ) {
    return {
      code,
      message,

      registered: false,

      phone:
        payload.phone ??
        cleanPhone,

      verificationId:
        payload.verificationId ??
        verificationId,

      signupToken:
        payload.signupToken,
    };
  }


  // ----------------------------------------------------------
  // EXISTING USER
  // ----------------------------------------------------------

  if (
    code === "LOGIN_SUCCESS"
  ) {
    if (!payload?.token_hash) {
      throw new Error(
        "Missing login token from server."
      );
    }

    const {
      data: sessionData,
      error: sessionError,
    } =
      await supabase.auth.verifyOtp({
        token_hash:
          payload.token_hash,
        type: "magiclink",
      });

    if (sessionError) {
      console.error(
        "[OTP] Session creation failed:",
        sessionError
      );

      throw sessionError;
    }

    if (!sessionData.session) {
      throw new Error(
        "Failed to create login session."
      );
    }

    console.log(
      "[OTP] Login session created."
    );

    return {
      code: "LOGIN_SUCCESS",
      message,
      registered: true,
      user: payload.user,
    };
  }

  // ----------------------------------------------------------
  // OTHER BACKEND RESPONSES
  // ----------------------------------------------------------

  return {
    code,
    message,

    phone:
      payload?.phone ??
      cleanPhone,

    verificationId:
      payload?.verificationId ??
      verificationId,

    registered:
      payload?.accountFound === true,
  };
}

