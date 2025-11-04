
  // Supabase setup
  const supabaseUrl = 'https://wrpntocksemglpxlmodd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const loginMessage = document.getElementById('login-message');

  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      loginMessage.style.color = 'red';
      loginMessage.textContent = error.message;
    } else {
      loginMessage.style.color = 'green';
      loginMessage.textContent = `Login successful! Welcome, ${data.user.email}`;
      // Optional: redirect to a dashboard
      // window.location.href = 'dashboard.html';
    }
  });

  // SIGNUP BUTTON
  const signupBtn = document.getElementById('signup-btn');
  const signupMessage = document.getElementById('signup-message');

  signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const { data, error } = await supabase.auth.signUp({ email, password });

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



