import { spawn } from "child_process";

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:4321";
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isRemote = process.env.REMOTE === "true" || process.env.REMOTE === "1";

  if (!adminEmail) { console.error('❌ ADMIN_EMAIL environment variable is required'); process.exit(1); }
  if (!adminPassword) { console.error('❌ ADMIN_PASSWORD environment variable is required'); console.error('   Generate a strong password: openssl rand -base64 24'); process.exit(1); }
  if (adminPassword.length < 16) { console.error('❌ ADMIN_PASSWORD must be at least 16 characters long'); process.exit(1); }

  console.log(`\n🚀 Seeding admin user...`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Admin Email: ${adminEmail}`);
  console.log(`   Remote Mode: ${isRemote ? "Yes" : "No"}\n`);

  const signUpRes = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": baseUrl, "Referer": baseUrl },
    body: JSON.stringify({ name: "Admin", email: adminEmail, password: adminPassword }),
  });
  const signUpData = await signUpRes.json();
  console.log("\n📝 Sign up response:", JSON.stringify(signUpData, null, 2));

  if (signUpRes.ok) {
    console.log("\n✅ Admin user created successfully!");
    console.log(`   Email: ${adminEmail}`);
    await setAdminRole(adminEmail, isRemote);
  } else {
    console.log("\n⚠️ Sign up failed. User may already exist.");
    await setAdminRole(adminEmail, isRemote);
  }
}

async function setAdminRole(email, isRemote) {
  console.log("\n🔧 Setting admin role...");
  const remoteFlag = isRemote ? "--remote" : "";
  return new Promise((resolve, reject) => {
    const args = ["d1", "execute", "DB", remoteFlag, "--command",
      `UPDATE users SET role = 'admin' WHERE email = '${email.replace(/'/g, "''")}'`
    ].filter(Boolean);
    const child = spawn("npx", ["wrangler", ...args], { stdio: "inherit", stderr: "inherit" });
    child.on("close", (code) => {
      if (code === 0) { console.log("\n✅ Admin role set successfully!"); console.log(`\n🎉 Admin user is ready!`); resolve(); }
      else { console.log("\n⚠️ Failed to set admin role. Please set manually."); resolve(); }
    });
  });
}

main().catch(console.error);
