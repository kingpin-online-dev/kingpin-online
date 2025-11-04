const supabaseUrl = 'https://wrpntocksemglpxlmodd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function loadUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // not logged in, send them back to home page
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcome-text").textContent = `Welcome, ${user.email}`;
}

// logout button
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

loadUser();
