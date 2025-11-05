document.addEventListener("DOMContentLoaded", async () => {
  const supabaseUrl = "https://wrpntocksemglpxlmodd.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycG50b2Nrc2VtZ2xweGxtb2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzQxNjcsImV4cCI6MjA3Nzg1MDE2N30.4DyuiCHzKXlvmmJgjfNo2RrF-pw-gbuaHIZXV5NR1wU";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const canvas = document.getElementById("crime-canvas");
const ctx = canvas?.getContext("2d");

function playCrimeAnimation(success) {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Start positions
  const player = { x: 40, y: canvas.height / 2 };
  const npc = { x: canvas.width - 60, y: canvas.height / 2 };

  let touched = false;
  let movingForward = true;

  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move player toward NPC until collision
    if (movingForward && !touched) {
      player.x += 2;

      // Check collision / touching
      if (Math.abs(player.x - npc.x) < 10) {
        touched = true;
        movingForward = false; // Begin walking away afterward
      }
    } else {
      // Walk back after touching
      player.x -= 2;
    }

    // Draw NPC (always white)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(npc.x, npc.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw Player:
    // - Gold before bump
    // - Turns green/red after bump
    ctx.fillStyle = touched ? (success ? "#00FF00" : "#FF0000") : "#FFD700";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // End the animation when player reaches starting point again
    if (touched && player.x < 20) {
      clearInterval(interval);
    }
  }, 30);
}



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

  // === SHOP LIST ===
async function loadShop() {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const shopList = document.getElementById('shop-list');
  shopList.innerHTML = '';

  data.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'shop-btn';
    btn.textContent = `${item.name} — $${item.price}`;
    btn.onclick = () => purchaseItem(item.id);
    shopList.appendChild(btn);
  });
}

// === INVENTORY ===
async function loadInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('quantity, shop_items(name, description)')
    .order('quantity', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const inv = document.getElementById('inventory-list');
  inv.innerHTML = '';

  data.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.textContent = `${entry.shop_items.name} x${entry.quantity}`;
    inv.appendChild(div);
  });
}

// === PURCHASE ITEM ===
async function purchaseItem(itemId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const resultEl = document.getElementById('shop-message');
  resultEl.textContent = "Processing purchase...";

  const { data, error } = await supabase.rpc('buy_item', { p_item_id: itemId });

  if (error) {
    console.error(error);
    resultEl.textContent = error.message;
    return;
  }

// Supabase returns RPC result as an array, so read index 0
const purchase = data?.[0];

if (purchase?.success) {
  resultEl.textContent = `✅ Purchase successful! You bought ${purchase.item_name}.`;
} else {
  resultEl.textContent = `❌ Not enough money.`;
}


  await updateStatsDisplay();
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
      resultEl.textContent = `⏳ Cooldown active. Try again in ${Math.ceil(data.remaining_seconds)} seconds.`;
    } else if (data.error === 'jailed' || data.error === 'jailed_now') {
      resultEl.textContent = data.message || `🚔 You're in jail!`;
    } else {
      resultEl.textContent = `Error: ${data.error}`;
    }

    await updateStatsDisplay();
    return;
  }

  // --- Success or failure outcome ---
  resultEl.textContent = data.success
    ? `✅ Success! You stole $${data.reward}.`
    : `❌ You failed the crime.`;

  playCrimeAnimation(data.success);

  await updateStatsDisplay();

  // Check for level-up
  if (data?.new_level && data?.new_level > 1) {
    const prevLevel = parseInt(document.getElementById('stat-level').textContent || 1);
    if (data.new_level > prevLevel) {
      alert(`🎉 You leveled up to Level ${data.new_level}!`);
    }
  }
} // ✅ Properly closes attemptCrime()


// === INITIAL PAGE LOAD ===
updateStatsDisplay();
loadCrimes();
loadShop();
loadInventory();
  
// === TAB SWITCHING ===
document.getElementById("tab-crimes").onclick = () => {
  document.getElementById("page-crimes").classList.add("active");
  document.getElementById("page-shop").classList.remove("active");
};

document.getElementById("tab-shop").onclick = () => {
  document.getElementById("page-shop").classList.add("active");
  document.getElementById("page-crimes").classList.remove("active");
};

document.getElementById("tab-inventory").onclick = () => {
  document.getElementById("page-inventory").classList.add("active");
  document.getElementById("page-crimes").classList.remove("active");
  document.getElementById("page-shop").classList.remove("active");
  loadInventory();
};

}); // ✅ Closes DOMContentLoaded

