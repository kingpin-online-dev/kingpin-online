// Wait until Supabase has definitely loaded
window.addEventListener('DOMContentLoaded', async () => {
  // Confirm Supabase is available
  if (!window.supabase) {
    console.error('Supabase library failed to load.');
    return;
  }

  // Initialize Supabase client
  const supabaseUrl = 'https://wrpntocksemglpxlmodd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU';
  const client = window.supabase.createClient(supabaseUrl, supabaseKey);

  // LOGIN BUTTON
  const loginBtn = document.getElementById('login-btn');
  const loginMessage = document.getElementById('login-message');

  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      loginMessage.style.color = 'red';
      loginMessage.textContent = error.message;
    } else {
      window.location.href = "dashboard.html";

    }
  });

  // SIGNUP BUTTON
  const signupBtn = document.getElementById('signup-btn');
  const signupMessage = document.getElementById('signup-message');

  signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const { data, error } = await client.auth.signUp({ email, password });

    if (error) {
      signupMessage.style.color = 'red';
      signupMessage.textContent = error.message;
    } else {
      signupMessage.style.color = 'green';
      signupMessage.textContent = 'Account created! Please log in.';
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
    }
  });
});



