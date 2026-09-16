/// <reference lib="deno.ns" />

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";


export interface StorageFile {

    path:string;

    bucket:string;

    signedUrl:string | null;

}


/**
 * Create private signed URL
 */
export async function createSignedUrl(
    supabase: SupabaseClient,
    bucket:string,
    path:string
):Promise<StorageFile>{


    const {
        data,
        error
    } =
    await supabase

    .storage

    .from(bucket)

    .createSignedUrl(
        path,
        60 * 10
    );



    if(error){

        throw new Error(
            error.message
        );

    }



    return {

        path,

        bucket,

        signedUrl:
        data.signedUrl

    };


}