/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabaseClient(request: Request){
const authHeader =
request.headers.get(
"Authorization"
);
return createClient(
Deno.env.get("SUPABASE_URL")!,
Deno.env.get("SUPABASE_ANON_KEY")!,
{
global:{
headers:{
Authorization:
authHeader ?? ""
}
}
}
);
}

export function getServiceSupabaseClient() {
    return createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
}