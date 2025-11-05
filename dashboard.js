document.addEventListener("DOMContentLoaded", async () => {
  const supabaseUrl = "https://wrpntocksemglpxlmodd.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // === PLAYER STATS ===
async function updateStatsDisplay() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('user_stats')
    .select('cash, reputation, heat, xp, level')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById('stat-cash').textContent = data.cash.toLocaleString();
  document.getElementById('stat-reputation').textContent = data.reputation;
  document.getElementById('stat-heat').textContent = data.heat;
  document.getElementById('stat-xp').textContent = data.xp.toLocaleString();
  document.getElementById('stat-level').textContent = data.level;
}


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
// === OPTIONAL NAME CHANGE FORM (UI may or may not exist) ===
const nameInput = document.getElementById("display-name");
const displayMessage = document.getElementById("display-message");

if (nameInput) {
  if (profile && profile.display_name) {
    nameInput.placeholder = `Current: ${profile.display_name}`;
  }

  document.getElementById("display-name-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = nameInput.value.trim();
    if (!newName) return;

    const now = new Date();
    const lastChange = profile?.last_name_change ? new Date(profile.last_name_change) : null;
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    if (lastChange && now - lastChange < oneYear) {
      displayMessage.style.color = "red";
      displayMessage.textContent = "You can only change your name once per year.";
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, display_name: newName, last_name_change: now.toISOString() },
        { onConflict: "user_id" }
      );

    if (updateError) {
      displayMessage.style.color = "red";
      displayMessage.textContent = updateError.message;
    } else {
      displayMessage.style.color = "green";
      displayMessage.textContent = "Display name updated!";
      nameInput.value = "";
      document.getElementById("user-email").textContent = newName;
    }
  });
}

  // Logout button
  document
    .getElementById("logout-btn")
    .addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });

  // === CRIME LIST ===
async function loadCrimes() {
  const { data, error } = await supabase
    .from('crimes')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const crimeList = document.getElementById('crime-list');
  crimeList.innerHTML = '';

  data.forEach(crime => {
    const btn = document.createElement('button');
    btn.className = 'crime-btn';
const playerLevel = parseInt(document.getElementById('stat-level').textContent || 1);

btn.textContent = `${crime.name} ($${crime.min_reward}-${crime.max_reward})`;

if (playerLevel < crime.min_level) {
  btn.disabled = true;
  btn.style.opacity = 0.4;
  btn.textContent += ` — 🔒 Requires Level ${crime.min_level}`;
} else {
  btn.onclick = () => attemptCrime(crime.key);
}

crimeList.appendChild(btn);
  });
}

  // === CRIME SYSTEM ===
async function attemptCrime(crimeKey) {
  const resultEl = document.getElementById('crime-result');
  resultEl.textContent = 'Attempting...';

  const { data, error } = await supabase.rpc('do_crime', { crime_key: crimeKey });

  if (error) {
    console.error(error);
    resultEl.textContent = error.message ?? 'Error performing crime.';
    return;
  }

  // --- Handle backend errors (cooldown, jail, etc.) ---
  if (data?.error) {
    if (data.error === 'cooldown') {
      resultEl.textContent = `⏳ Cooldown active. Try again in ${Math.ceil(
        data.remaining_seconds
      )} seconds.`;
    } 
    else if (data.error === 'jailed' || data.error === 'jailed_now') {
      resultEl.textContent =
        data.message ||
        `🚔 You're in jail for ${Math.ceil(data.remaining_seconds / 60)} minutes!`;
    } 
    else {
      resultEl.textContent = `Error: ${data.error}`;
    }

    // Always refresh stats so the player sees updated heat / cash even if jailed
    await updateStatsDisplay();
    return;
  }

  // --- Success or failure outcome ---
  if (data.success) {
    resultEl.textContent = `✅ Success! You stole $${data.reward}.`;
  } else {
    resultEl.textContent = `❌ You failed the crime.`;
  }

  // 🔄 Refresh player stats instantly
  await updateStatsDisplay();

  // Check for level-up
if (data?.new_level && data?.new_level > 1) {
  const prevLevel = parseInt(document.getElementById('stat-level').textContent || 1);
  if (data.new_level > prevLevel) {
    alert(`🎉 You leveled up to Level ${data.new_level}!`);
  }
}

}
  // Show stats when page opens
updateStatsDisplay();
loadCrimes();

document.getElementById("tab-crimes").onclick = () => {
  document.getElementById("page-crimes").classList.add("active");
  document.getElementById("page-shop").classList.remove("active");
};

document.getElementById("tab-shop").onclick = () => {
  document.getElementById("page-shop").classList.add("active");
  document.getElementById("page-crimes").classList.remove("active");
};

});

