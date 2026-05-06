import { supabase } from "../../supabase";

export const testSupabaseConnection = async () => {
  console.log("=== SUPABASE CONNECTION TEST ===");
  
  try {
    // Test 1: Check if client is initialized
    console.log("[TEST 1] Supabase client initialized:", supabase ? "✓" : "✗");
    
    // Test 2: Check auth status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log("[TEST 2] Auth session:", session ? "✓ User logged in" : "✗ No user session");
    if (authError) console.error("[TEST 2] Auth error:", authError);
    
    // Test 3: Check genre table
    console.log("[TEST 3] Fetching from 'genre' table...");
    const { data: genreData, error: genreError } = await supabase
      .from('genre')
      .select('*')
      .limit(5);
    
    console.log("[TEST 3] Data count:", genreData?.length || 0);
    console.log("[TEST 3] First items:", genreData?.slice(0, 2));
    if (genreError) {
      console.error("[TEST 3] Genre query error:", {
        message: genreError.message,
        hint: (genreError as any).hint,
        code: (genreError as any).code,
        details: (genreError as any).details,
      });
    }
    
    // Test 4: Check RLS
    console.log("[TEST 4] Testing table accessibility (checking RLS)...");
    const { data: rlsTest, error: rlsError } = await supabase
      .from('genre')
      .select('count(*)', { count: 'exact' });
    
    console.log("[TEST 4] RLS test:", rlsError ? `✗ Error: ${rlsError.message}` : `✓ OK`);
    
    // Test 5: Check with explicit select columns
    console.log("[TEST 5] Testing with explicit columns (genre, describe)...");
    const { data: colTest, error: colError } = await supabase
      .from('genre')
      .select('genre, describe')
      .limit(3);
    
    console.log("[TEST 5] Column test:", colError ? `✗ Error: ${colError.message}` : `✓ OK`);
    console.log("[TEST 5] Data:", colTest);
    
    console.log("=== END TEST ===");
    
    return {
      clientOk: !!supabase,
      sessionOk: !!session,
      genreTableOk: !genreError && (genreData?.length || 0) > 0,
      rlsOk: !rlsError,
      columnsOk: !colError,
      genreData,
      genreError,
      rlsError,
    };
  } catch (e) {
    console.error("[CATCH] Exception during test:", e);
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
};
