-- Passkey support for WebAuthn authentication
-- Required by better-auth passkey plugin

CREATE TABLE IF NOT EXISTS `passkey` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT,
  `credentialID` TEXT NOT NULL UNIQUE,
  `credentialPublicKey` TEXT NOT NULL,
  `counter` INTEGER NOT NULL,
  `credentialDeviceType` TEXT,
  `credentialBackedUp` INTEGER,
  `transports` TEXT,
  `aaguid` TEXT,
  `userId` TEXT NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `createdAt` INTEGER NOT NULL,
  `updatedAt` INTEGER NOT NULL
);
