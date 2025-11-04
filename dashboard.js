document.addEventListener("DOMContentLoaded", async () => {
  const supabaseUrl = "https://wrpntocksemglpxlmodd.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Get current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login page if no user is logged in
    window.location.href = "index.html";
    return;
  }

  document.getElementById("user-email").textContent = user.email;

  // Logout handler
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
});
