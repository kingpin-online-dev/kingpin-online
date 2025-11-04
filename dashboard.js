document.addEventListener("DOMContentLoaded", async () => {
  const supabaseUrl = "https://wrpntocksemglpxlmodd.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Get current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Fetch player's profile info (display name)
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, last_name_change")
    .eq("user_id", user.id)
    .single();

  const nameTarget = document.getElementById("user-email");

  if (profile && profile.display_name) {
    nameTarget.textContent = profile.display_name;
  } else {
    nameTarget.textContent = user.email;
  }

  // Handle display name changes
  const nameInput = document.getElementById("display-name");
  const displayMessage = document.getElementById("display-message");

  if (profile && profile.display_name) {
    nameInput.placeholder = `Current: ${profile.display_name}`;
  }

  document
    .getElementById("display-name-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const newName = nameInput.value.trim();

      if (!newName) {
        displayMessage.style.color = "red";
        displayMessage.textContent = "Please enter a valid name.";
        return;
      }

      const now = new Date();
      const lastChange = profile?.last_name_change
        ? new Date(profile.last_name_change)
        : null;
      const oneYear = 365 * 24 * 60 * 60 * 1000;

      if (lastChange && now - lastChange < oneYear) {
        displayMessage.style.color = "red";
        displayMessage.textContent =
          "You can only change your name once per year.";
        return;
      }

      const { error: updateError } = await supabase.from("profiles").upsert({
        user_id: user.id,
        display_name: newName,
        last_name_change: now.toISOString(),
      });

      if (updateError) {
        displayMessage.style.color = "red";
        displayMessage.textContent = updateError.message;
      } else {
        displayMessage.style.color = "green";
        displayMessage.textContent = "Display name updated!";
        nameInput.value = "";
        nameTarget.textContent = newName;
      }
    });

  // Logout button
  document
    .getElementById("logout-btn")
    .addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });
});

